import {authenticate, TokenService} from '@loopback/authentication';
import {
  UserRepository as JWTUserRepository,
  TokenServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';

import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody,
  response,
} from '@loopback/rest';

import {compare, genSalt, hash} from 'bcryptjs';
import {randomBytes} from 'crypto';
import {ObjectId} from 'mongodb';
import {User, UserRelations} from '../models';
import {UserRepository} from '../repositories';
import AuthGoogleService from '../services/auth-google.service';
import {EMAIL_SERVICE, EmailServices} from '../services/mailers.service';

export class AuthController {

  constructor(
    @inject(EMAIL_SERVICE) private emailServices: EmailServices,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository)
    protected jwtUserRepository: JWTUserRepository,
    @repository(UserRepository) protected userRepository: UserRepository,
    @inject(LoggingBindings.WINSTON_LOGGER)
    private logger: WinstonLogger
  ) { }

  @post('/auth/login')
  @response(200, {
    description: 'Password reset',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {token: {type: 'string'}, userData: {type: 'object'}},
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: {type: 'string'},
              password: {type: 'string'},
              generatedPassword: {type: 'boolean'},
            },
          },
        },
      },
    })
    request: {
      email: string;
      password: string;
      generatedPassword: boolean | false;
    },
  ): Promise<{userData: User}> {
    const findOneUser = await this.userRepository.findOne({
      where: {
        and: [{email: request.email}, {status: 1}],
      },
    });

    if (!findOneUser) {
      throw new HttpErrors.NotFound('User not found');
    }
    let isPasswordValid = true;
    if (!request.generatedPassword) {
      if (findOneUser.password != null) {
        isPasswordValid = await compare(request.password, findOneUser.password);
      }
    } else {
      isPasswordValid = request.password == findOneUser.password;
    }

    if (!isPasswordValid) {
      throw new HttpErrors.NotFound('Password not match');
    }

    const token = await this.jwtService.generateToken({
      email: findOneUser.email,
      name: `${findOneUser.displayName}`,
      [securityId]: findOneUser.id.toString(),
    });
    findOneUser.token = token;

    return {userData: findOneUser};
  }

  @post('/auth/login-with-third')
  @response(200, {
    description: 'Third-party login',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            userData: {type: 'object'},
          },
        },
      },
    },
  })
  async loginWith(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              idToken: {type: 'string'},
              redirectUri: {type: 'string'},
              type: {type: 'string'},
            },
            required: ['idToken', 'type'],
          },
        },
      },
    })
    request: {
      idToken: string;
      redirectUri: string | null;
      type: string;
    },
  ): Promise<{token: string | object | null; userData: User & UserRelations | null; token_third: string | object | null;}> {
    let findOneUser: (User & UserRelations) | null = null;
    let tokenData = null;
    try {
      if (request.type === 'GOOGLE') {
        const getUser = await AuthGoogleService.getUserLogin({token: request.idToken});
        if (!getUser.data) {
          throw new HttpErrors.NotFound('Token does not have any data');
        }
        findOneUser = getUser.data as (User & UserRelations);
      } else {
        throw new HttpErrors.BadRequest('Unsupported authentication type');
      }

      if (findOneUser) {
        const token = await this.jwtService.generateToken({
          email: findOneUser.email,
          name: findOneUser.displayName,
          [securityId]: findOneUser.id.toString(),
        });

        return {token, userData: findOneUser, token_third: tokenData};
      } else {
        throw new HttpErrors.Unauthorized('User not found');
      }
    } catch (error) {
      this.logger.error(error);
      throw new HttpErrors.ExpectationFailed('Error verifying token : ' + error.toString());
    }
  }

  @authenticate('jwt')
  @get('/auth/verify', {
    responses: {
      '200': {
        description: 'Auth verify token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {type: 'string'},
                userData: {
                  type: 'object',
                  properties: {
                    id: {type: 'number'},
                    email: {type: 'string'},
                    displayName: {type: 'string'},
                    // Add other properties you want to expose
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<{token: string; userData: User & UserRelations}> {
    const userId = currentUserProfile[securityId];
    const objectIdUserId = new ObjectId(userId);
    const findOneUser = await this.userRepository.findById(objectIdUserId);

    if (!findOneUser) {
      throw new HttpErrors.NotFound('User not found');
    }

    const token = await this.jwtService.generateToken({
      email: findOneUser.email,
      name: findOneUser.displayName,
      [securityId]: findOneUser.id.toString(),
    });

    return {token, userData: findOneUser};
  }

  @post('/auth/signup')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    // Check if the user with the given email already exists
    const existingUser = await this.userRepository.findOne({
      where: {email: user.email},
    });

    if (existingUser) {
      throw new HttpErrors.Conflict(
        `User with email ${user.email} already exists`,
      );
    }

    // Set default values for the new user
    user.status = 1; // Active status
    if (user.password != '' && user.password != null) {
      user.password = await hash(user.password, await genSalt());
    }

    // Create the new user
    const savedUser = await this.userRepository.create(user);

    return savedUser;
  }

  @authenticate('jwt')
  @post('/auth/edit-profile')
  @response(204, {
    description: 'User PUT success',
  })
  async editProfile(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    userData: Partial<User>,
  ): Promise<User> {
    const existingUser = await this.userRepository.getUserLogin({currentUserProfile});

    if (userData.email && userData.email !== existingUser.email) {
      const emailValidationCheck = await this.userRepository.findOne({
        where: {email: userData.email, id: {neq: existingUser.id}},
      });
      if (emailValidationCheck) {
        throw new HttpErrors.Conflict(
          `User with email ${userData.email} already exists`,
        );
      }
    }

    if (userData.password) {
      userData.password = await hash(userData.password, await genSalt());
    }

    if (userData.imageUrl === '') {
      userData.imageUrl = existingUser.imageUrl;
    }
    userData.updatedAt = new Date();
    userData.userUpdated = existingUser;

    await this.userRepository.updateById(existingUser.id, userData);
    return this.userRepository.findById(existingUser.id);
  }

  @post('/auth/forgot')
  @response(200, {
    description: 'Forgot password',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {message: {type: 'string'}}},
      },
    },
  })
  async forgot(
    @requestBody({
      content: {
        'application/json': {
          schema: {type: 'object', properties: {email: {type: 'string'}}},
        },
      },
    })
    request: {email: string},
  ): Promise<{message: string}> {
    const {email} = request;

    // Find user by email and active status
    const existingUser = await this.userRepository.findOne({
      where: {email, status: 1},
    });

    if (!existingUser) {
      throw new HttpErrors.NotFound(`User with email ${email} does not exist.`);
    }

    // Generate OTP
    const otp = randomBytes(3).toString('hex');
    const newDateNow = new Date();
    const otpExpiration = new Date(newDateNow.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

    // Update user with OTP and expiration date
    existingUser.otp = otp;
    existingUser.otpExpired = otpExpiration;
    await this.userRepository.updateById(existingUser.id, existingUser);

    // Send OTP email
    try {
      await this.emailServices.sendEmail(
        existingUser.email,
        '[FANALYST APP] Forgot Password',
        `This is your OTP for resetting your password: ${otp}. It will expire in 3 hours.`,
      );
    } catch (error) {
      console.error('Error sending email: ', error);
      throw new HttpErrors.InternalServerError('Failed to send OTP email.');
    }

    return {message: 'SUCCESS'};
  }

  @post('/auth/reset')
  @response(200, {
    description: 'Password reset',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {message: {type: 'string'}}},
      },
    },
  })
  async reset(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              otp: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    request: {otp: string; password: string},
  ): Promise<{message: string}> {
    const {otp, password} = request;
    const currentDateTime = new Date();

    // Find user by OTP and check if OTP is still valid
    const existingUser = await this.userRepository.findOne({
      where: {
        otp,
        otpExpired: {gt: currentDateTime},
      },
    });

    if (!existingUser) {
      throw new HttpErrors.NotFound('OTP is not valid or has expired.');
    }

    // Update user's password and clear OTP fields
    existingUser.otp = '';
    existingUser.otpExpired = null;
    existingUser.password = await hash(password, await genSalt());
    await this.userRepository.updateById(existingUser.id, existingUser);

    return {message: 'Password reset successful.'};
  }

  @authenticate('jwt')
  @del('/auth/delete-account')
  @response(200, {
    description: 'delete account',
    content: {
      'application/json': {
        schema: {type: 'object', properties: {message: {type: 'string'}}},
      },
    },
  })
  async deleteAccount(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<{message: string}> {
    const uId: string = currentUserProfile[securityId];
    const objectIdUserId = new ObjectId(uId);
    const existingUser = await this.userRepository.findById(objectIdUserId);
    existingUser.status = 0;
    existingUser.statusDeleted = 1;
    await this.userRepository.updateById(existingUser.id, existingUser);

    return {message: 'SUCCESS'};
  }
}

import {authenticate, TokenService} from '@loopback/authentication';
import {
  UserRepository as JWTUserRepository,
  TokenServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {LoggingBindings, WinstonLogger} from '@loopback/logging';
import {SecurityBindings, UserProfile} from '@loopback/security';

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {ObjectId} from 'mongodb';
import {User} from '../models';
import {UserRepository} from '../repositories';

@authenticate('jwt')
export class UsersController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(JWTUserRepository)
    protected jwtUserRepository: JWTUserRepository,
    @inject(LoggingBindings.WINSTON_LOGGER)
    private logger: WinstonLogger,
    @inject(SecurityBindings.USER)
    private currentUserProfile: UserProfile,
  ) { }

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: [
              'id',
              'statusDeleted',
              'createdAt',
              'updatedAt',
              'statusDeleted',
              'userCreated',
              'userUpdated',
              'userDeleted',
            ],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: {email: user.email},
    });

    if (existingUser) {
      throw new HttpErrors.Conflict(
        `User with email ${user.email} already exists`,
      );
    }

    if (user.password != '' && user.password != null) {
      user.password = await hash(user.password, await genSalt());
    }
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      user.userCreated = authUser;
    }
    return this.userRepository.create(user);
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @get('/users/pagination')
  @response(200, {
    description: 'Array of User pagination model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(User) filter?: Filter<User>): Promise<{
    records: User[];
    totalCount: number | 0;
  }> {
    var records = await this.userRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.userRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      user.updatedAt = new Date();
      user.userUpdated = authUser;
    }
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    const objectIdUserId = new ObjectId(id);
    return this.userRepository.findById(objectIdUserId, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<User> {
    if (user.password != '' && user.password != null) {
      user.password = await hash(user.password, await genSalt());
    }
    const objectIdUserId = new ObjectId(id);
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      user.updatedAt = new Date();
      user.userUpdated = authUser;
    }
    await this.userRepository.replaceById(objectIdUserId, user);
    return this.userRepository.findById(objectIdUserId);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') userId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    userData: User,
  ): Promise<User> {
    const objectIdUserId = new ObjectId(userId);
    const existingUser = await this.userRepository.findOne({
      where: {
        and: [
          {id: {nin: [objectIdUserId]}}, // Gunakan ObjectId untuk _id
          {email: userData.email},
        ],
      },
    });
    if (existingUser) {
      throw new HttpErrors.Conflict(
        `User with email ${userData.email} already exists`,
      );
    }

    if (userData.password != undefined && userData.password != '') {
      userData.password = await hash(userData.password, await genSalt());
    } else {
      delete userData.password;
    }
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      userData.updatedAt = new Date();
      userData.userUpdated = authUser;
    }
    await this.userRepository.updateById(objectIdUserId, userData);
    return this.userRepository.findById(objectIdUserId);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const objectIdUserId = new ObjectId(id);
    await this.userRepository.deleteById(objectIdUserId);
  }
}

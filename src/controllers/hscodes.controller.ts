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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {ObjectId} from 'mongodb';
import {Hscode} from '../models';
import {HscodeRepository, UserRepository} from '../repositories';

@authenticate('jwt')
export class HscodesController {
  constructor(
    @repository(HscodeRepository)
    public hscodeRepository: HscodeRepository,
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

  @post('/hscodes')
  @response(200, {
    description: 'Hscode model instance',
    content: {'application/json': {schema: getModelSchemaRef(Hscode)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hscode, {
            title: 'NewHscode',
            exclude: ['id'],
          }),
        },
      },
    })
    hscode: Omit<Hscode, 'id'>,
  ): Promise<Hscode> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      hscode.userCreated = authUser;
    }

    return this.hscodeRepository.create(hscode);
  }

  @get('/hscodes/count')
  @response(200, {
    description: 'Hscode model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Hscode) where?: Where<Hscode>,
  ): Promise<Count> {
    return this.hscodeRepository.count(where);
  }

  @get('/hscodes')
  @response(200, {
    description: 'Array of Hscode model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Hscode, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Hscode) filter?: Filter<Hscode>,
  ): Promise<Hscode[]> {
    return this.hscodeRepository.find(filter);
  }

  @get('/hscodes/pagination')
  @response(200, {
    description: 'Array of User pagination model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Hscode, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(Hscode) filter?: Filter<Hscode>): Promise<{
    records: Hscode[];
    totalCount: number | 0;
  }> {
    var records = await this.hscodeRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.hscodeRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/hscodes')
  @response(200, {
    description: 'Hscode PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hscode, {partial: true}),
        },
      },
    })
    hscode: Hscode,
    @param.where(Hscode) where?: Where<Hscode>,
  ): Promise<Count> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      hscode.userUpdated = authUser;
      hscode.updatedAt = new Date();
    }
    return this.hscodeRepository.updateAll(hscode, where);
  }

  @get('/hscodes/{id}')
  @response(200, {
    description: 'Hscode model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Hscode, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Hscode, {exclude: 'where'}) filter?: FilterExcludingWhere<Hscode>
  ): Promise<Hscode> {
    const objectId = new ObjectId(id);
    return this.hscodeRepository.findById(objectId, filter);
  }

  @patch('/hscodes/{id}')
  @response(204, {
    description: 'Hscode PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Hscode, {partial: true}),
        },
      },
    })
    hscode: Hscode,
  ): Promise<void> {
    const objectId = new ObjectId(id);
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    // console.log(authUser);
    if (authUser) {
      hscode.userUpdated = authUser;
      hscode.updatedAt = new Date();
    }
    await this.hscodeRepository.updateById(objectId, hscode);
  }

  @put('/hscodes/{id}')
  @response(204, {
    description: 'Hscode PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() hscode: Hscode,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      hscode.userUpdated = authUser;
      hscode.updatedAt = new Date();
    }
    const objectId = new ObjectId(id);
    await this.hscodeRepository.replaceById(objectId, hscode);
  }

  @del('/hscodes/{id}')
  @response(204, {
    description: 'Hscode DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const objectId = new ObjectId(id);
    await this.hscodeRepository.deleteById(objectId);
  }
}

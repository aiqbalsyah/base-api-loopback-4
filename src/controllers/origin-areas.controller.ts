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
import {OriginArea} from '../models';
import {OriginAreaRepository, UserRepository} from '../repositories';

@authenticate('jwt')
export class OriginAreasController {
  constructor(
    @repository(OriginAreaRepository)
    public originAreaRepository: OriginAreaRepository,
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

  @post('/origin-areas')
  @response(200, {
    description: 'OriginArea model instance',
    content: {'application/json': {schema: getModelSchemaRef(OriginArea)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OriginArea, {
            title: 'NewOriginArea',
            exclude: ['id'],
          }),
        },
      },
    })
    originArea: Omit<OriginArea, 'id'>,
  ): Promise<OriginArea> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      originArea.userCreated = authUser;
    }
    return this.originAreaRepository.create(originArea);
  }

  @get('/origin-areas/count')
  @response(200, {
    description: 'OriginArea model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(OriginArea) where?: Where<OriginArea>,
  ): Promise<Count> {
    return this.originAreaRepository.count(where);
  }

  @get('/origin-areas/pagination')
  @response(200, {
    description: 'Array of currency pagination model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OriginArea, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(OriginArea) filter?: Filter<OriginArea>): Promise<{
    records: OriginArea[];
    totalCount: number | 0;
  }> {
    var records = await this.originAreaRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.originAreaRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @get('/origin-areas')
  @response(200, {
    description: 'Array of OriginArea model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OriginArea, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(OriginArea) filter?: Filter<OriginArea>,
  ): Promise<OriginArea[]> {
    return this.originAreaRepository.find(filter);
  }

  @patch('/origin-areas')
  @response(200, {
    description: 'OriginArea PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OriginArea, {partial: true}),
        },
      },
    })
    originArea: OriginArea,
    @param.where(OriginArea) where?: Where<OriginArea>,
  ): Promise<Count> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      originArea.userUpdated = authUser;
      originArea.updatedAt = new Date();
    }
    return this.originAreaRepository.updateAll(originArea, where);
  }

  @get('/origin-areas/{id}')
  @response(200, {
    description: 'OriginArea model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(OriginArea, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: ObjectId,
    @param.filter(OriginArea, {exclude: 'where'}) filter?: FilterExcludingWhere<OriginArea>
  ): Promise<OriginArea> {
    return this.originAreaRepository.findById(id, filter);
  }

  @patch('/origin-areas/{id}')
  @response(204, {
    description: 'OriginArea PATCH success',
  })
  async updateById(
    @param.path.string('id') id: ObjectId,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OriginArea, {partial: true}),
        },
      },
    })
    originArea: OriginArea,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      originArea.userUpdated = authUser;
      originArea.updatedAt = new Date();
    }
    await this.originAreaRepository.updateById(id, originArea);
  }

  @put('/origin-areas/{id}')
  @response(204, {
    description: 'OriginArea PUT success',
  })
  async replaceById(
    @param.path.string('id') id: ObjectId,
    @requestBody() originArea: OriginArea,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      originArea.userUpdated = authUser;
      originArea.updatedAt = new Date();
    }
    await this.originAreaRepository.replaceById(id, originArea);
  }

  @del('/origin-areas/{id}')
  @response(204, {
    description: 'OriginArea DELETE success',
  })
  async deleteById(@param.path.string('id') id: ObjectId): Promise<void> {
    await this.originAreaRepository.deleteById(id);
  }
}

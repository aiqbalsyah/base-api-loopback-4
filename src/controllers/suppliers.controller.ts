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
import {Supplier} from '../models';
import {SupplierRepository, UserRepository} from '../repositories';

@authenticate('jwt')
export class SuppliersController {
  constructor(
    @repository(SupplierRepository)
    public supplierRepository: SupplierRepository,
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

  @post('/suppliers')
  @response(200, {
    description: 'Supplier model instance',
    content: {'application/json': {schema: getModelSchemaRef(Supplier)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Supplier, {
            title: 'NewSupplier',
            exclude: ['id'],
          }),
        },
      },
    })
    supplier: Omit<Supplier, 'id'>,
  ): Promise<Supplier> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      supplier.userCreated = authUser;
    }
    return this.supplierRepository.create(supplier);
  }

  @get('/suppliers/count')
  @response(200, {
    description: 'Supplier model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Supplier) where?: Where<Supplier>,
  ): Promise<Count> {
    return this.supplierRepository.count(where);
  }

  @get('/suppliers/pagination')
  @response(200, {
    description: 'Array of Supplier pagination model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Supplier, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(Supplier) filter?: Filter<Supplier>): Promise<{
    records: Supplier[];
    totalCount: number | 0;
  }> {
    var records = await this.supplierRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.supplierRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }


  @get('/suppliers')
  @response(200, {
    description: 'Array of Supplier model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Supplier, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Supplier) filter?: Filter<Supplier>,
  ): Promise<Supplier[]> {
    return this.supplierRepository.find(filter);
  }

  @patch('/suppliers')
  @response(200, {
    description: 'Supplier PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Supplier, {partial: true}),
        },
      },
    })
    supplier: Supplier,
    @param.where(Supplier) where?: Where<Supplier>,
  ): Promise<Count> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      supplier.userUpdated = authUser;
      supplier.updatedAt = new Date();
    }
    return this.supplierRepository.updateAll(supplier, where);
  }

  @get('/suppliers/{id}')
  @response(200, {
    description: 'Supplier model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Supplier, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Supplier, {exclude: 'where'}) filter?: FilterExcludingWhere<Supplier>
  ): Promise<Supplier> {
    const objectId = new ObjectId(id);
    return this.supplierRepository.findById(objectId, filter);
  }

  @patch('/suppliers/{id}')
  @response(204, {
    description: 'Supplier PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Supplier, {partial: true}),
        },
      },
    })
    supplier: Supplier,
  ): Promise<void> {
    const objectId = new ObjectId(id);
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      supplier.userUpdated = authUser;
      supplier.updatedAt = new Date();
    }
    await this.supplierRepository.updateById(objectId, supplier);
  }

  @put('/suppliers/{id}')
  @response(204, {
    description: 'Supplier PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() supplier: Supplier,
  ): Promise<void> {
    const objectId = new ObjectId(id);
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      supplier.userUpdated = authUser;
      supplier.updatedAt = new Date();
    }
    await this.supplierRepository.replaceById(objectId, supplier);
  }

  @del('/suppliers/{id}')
  @response(204, {
    description: 'Supplier DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const objectId = new ObjectId(id);
    await this.supplierRepository.deleteById(objectId);
  }
}

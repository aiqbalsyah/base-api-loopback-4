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
import {Currency} from '../models';
import {CurrencyRepository, UserRepository} from '../repositories';

@authenticate('jwt')
export class CurrenciesController {
  constructor(
    @repository(CurrencyRepository)
    public currencyRepository: CurrencyRepository,
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

  @post('/currencies')
  @response(200, {
    description: 'Currency model instance',
    content: {'application/json': {schema: getModelSchemaRef(Currency)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {
            title: 'NewCurrency',
            exclude: ['id'],
          }),
        },
      },
    })
    currency: Omit<Currency, 'id'>,
  ): Promise<Currency> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      currency.userCreated = authUser;
    }
    return this.currencyRepository.create(currency);
  }

  @get('/currencies/count')
  @response(200, {
    description: 'Currency model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Currency) where?: Where<Currency>,
  ): Promise<Count> {
    return this.currencyRepository.count(where);
  }

  @get('/currencies')
  @response(200, {
    description: 'Array of Currency model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Currency, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Currency) filter?: Filter<Currency>,
  ): Promise<Currency[]> {
    return this.currencyRepository.find(filter);
  }

  @get('/currencies/pagination')
  @response(200, {
    description: 'Array of currency pagination model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Currency, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(Currency) filter?: Filter<Currency>): Promise<{
    records: Currency[];
    totalCount: number | 0;
  }> {
    var records = await this.currencyRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.currencyRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/currencies')
  @response(200, {
    description: 'Currency PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {partial: true}),
        },
      },
    })
    currency: Currency,
    @param.where(Currency) where?: Where<Currency>,
  ): Promise<Count> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      currency.userUpdated = authUser;
      currency.updatedAt = new Date();
    }
    return this.currencyRepository.updateAll(currency, where);
  }

  @get('/currencies/{id}')
  @response(200, {
    description: 'Currency model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Currency, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: ObjectId,
    @param.filter(Currency, {exclude: 'where'}) filter?: FilterExcludingWhere<Currency>
  ): Promise<Currency> {
    return this.currencyRepository.findById(id, filter);
  }

  @patch('/currencies/{id}')
  @response(204, {
    description: 'Currency PATCH success',
  })
  async updateById(
    @param.path.string('id') id: ObjectId,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Currency, {partial: true}),
        },
      },
    })
    currency: Currency,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      currency.userUpdated = authUser;
      currency.updatedAt = new Date();
    }
    await this.currencyRepository.updateById(id, currency);
  }

  @put('/currencies/{id}')
  @response(204, {
    description: 'Currency PUT success',
  })
  async replaceById(
    @param.path.string('id') id: ObjectId,
    @requestBody() currency: Currency,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      currency.userUpdated = authUser;
      currency.updatedAt = new Date();
    }
    await this.currencyRepository.replaceById(id, currency);
  }

  @del('/currencies/{id}')
  @response(204, {
    description: 'Currency DELETE success',
  })
  async deleteById(@param.path.string('id') id: ObjectId): Promise<void> {
    await this.currencyRepository.deleteById(id);
  }
}

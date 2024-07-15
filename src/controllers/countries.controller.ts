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
import {Country} from '../models';
import {CountryRepository, UserRepository} from '../repositories';

@authenticate('jwt')
export class CountriesController {
  constructor(
    @repository(CountryRepository)
    public countryRepository: CountryRepository,
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

  @post('/countries')
  @response(200, {
    description: 'Country model instance',
    content: {'application/json': {schema: getModelSchemaRef(Country)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Country, {
            title: 'NewCountry',
            exclude: ['id'],
          }),
        },
      },
    })
    country: Omit<Country, 'id'>,
  ): Promise<Country> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      country.userCreated = authUser;
    }
    return this.countryRepository.create(country);
  }

  @get('/countries/count')
  @response(200, {
    description: 'Country model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Country) where?: Where<Country>,
  ): Promise<Count> {
    return this.countryRepository.count(where);
  }

  @get('/countries')
  @response(200, {
    description: 'Array of Country model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Country, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Country) filter?: Filter<Country>,
  ): Promise<Country[]> {
    return this.countryRepository.find(filter);
  }

  @get('/countries/pagination')
  @response(200, {
    description: 'Array of country pagination model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Country, {includeRelations: true}),
        },
      },
    },
  })
  async findPagination(@param.filter(Country) filter?: Filter<Country>): Promise<{
    records: Country[];
    totalCount: number | 0;
  }> {
    var records = await this.countryRepository.find(filter);
    var where = filter?.where; //UNSET LIMIT FROM FILTER
    var totalCountData = await this.countryRepository.count(where);
    return {records: records, totalCount: totalCountData.count};
  }

  @patch('/countries')
  @response(200, {
    description: 'Country PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Country, {partial: true}),
        },
      },
    })
    country: Country,
    @param.where(Country) where?: Where<Country>,
  ): Promise<Count> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      country.userUpdated = authUser;
      country.updatedAt = new Date();
    }
    return this.countryRepository.updateAll(country, where);
  }

  @get('/countries/{id}')
  @response(200, {
    description: 'Country model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Country, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: ObjectId,
    @param.filter(Country, {exclude: 'where'}) filter?: FilterExcludingWhere<Country>
  ): Promise<Country> {
    return this.countryRepository.findById(id, filter);
  }

  @patch('/countries/{id}')
  @response(204, {
    description: 'Country PATCH success',
  })
  async updateById(
    @param.path.string('id') id: ObjectId,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Country, {partial: true}),
        },
      },
    })
    country: Country,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      country.userUpdated = authUser;
      country.updatedAt = new Date();
    }
    await this.countryRepository.updateById(id, country);
  }

  @put('/countries/{id}')
  @response(204, {
    description: 'Country PUT success',
  })
  async replaceById(
    @param.path.string('id') id: ObjectId,
    @requestBody() country: Country,
  ): Promise<void> {
    const authUser = await this.userRepository.getUserLogin({currentUserProfile: this.currentUserProfile});
    if (authUser) {
      country.userUpdated = authUser;
      country.updatedAt = new Date();
    }
    await this.countryRepository.replaceById(id, country);
  }

  @del('/countries/{id}')
  @response(204, {
    description: 'Country DELETE success',
  })
  async deleteById(@param.path.string('id') id: ObjectId): Promise<void> {
    await this.countryRepository.deleteById(id);
  }
}

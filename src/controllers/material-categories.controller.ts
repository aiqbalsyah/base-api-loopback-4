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
import {MaterialCategory} from '../models';
import {MaterialCategoryRepository} from '../repositories';

export class MaterialCategoriesController {
  constructor(
    @repository(MaterialCategoryRepository)
    public materialCategoryRepository: MaterialCategoryRepository,
  ) { }

  @post('/material-categories')
  @response(200, {
    description: 'MaterialCategory model instance',
    content: {'application/json': {schema: getModelSchemaRef(MaterialCategory)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MaterialCategory, {
            title: 'NewMaterialCategory',
            exclude: ['id'],
          }),
        },
      },
    })
    materialCategory: Omit<MaterialCategory, 'id'>,
  ): Promise<MaterialCategory> {
    return this.materialCategoryRepository.create(materialCategory);
  }

  @get('/material-categories/count')
  @response(200, {
    description: 'MaterialCategory model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(MaterialCategory) where?: Where<MaterialCategory>,
  ): Promise<Count> {
    return this.materialCategoryRepository.count(where);
  }

  @get('/material-categories')
  @response(200, {
    description: 'Array of MaterialCategory model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MaterialCategory, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(MaterialCategory) filter?: Filter<MaterialCategory>,
  ): Promise<MaterialCategory[]> {
    return this.materialCategoryRepository.find(filter);
  }

  @patch('/material-categories')
  @response(200, {
    description: 'MaterialCategory PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MaterialCategory, {partial: true}),
        },
      },
    })
    materialCategory: MaterialCategory,
    @param.where(MaterialCategory) where?: Where<MaterialCategory>,
  ): Promise<Count> {
    return this.materialCategoryRepository.updateAll(materialCategory, where);
  }

  @get('/material-categories/{id}')
  @response(200, {
    description: 'MaterialCategory model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(MaterialCategory, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(MaterialCategory, {exclude: 'where'}) filter?: FilterExcludingWhere<MaterialCategory>
  ): Promise<MaterialCategory> {
    const objectId = new ObjectId(id);
    return this.materialCategoryRepository.findById(objectId, filter);
  }

  @patch('/material-categories/{id}')
  @response(204, {
    description: 'MaterialCategory PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MaterialCategory, {partial: true}),
        },
      },
    })
    materialCategory: MaterialCategory,
  ): Promise<void> {
    const objectId = new ObjectId(id);
    await this.materialCategoryRepository.updateById(objectId, materialCategory);
  }

  @put('/material-categories/{id}')
  @response(204, {
    description: 'MaterialCategory PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() materialCategory: MaterialCategory,
  ): Promise<void> {
    const objectId = new ObjectId(id);
    await this.materialCategoryRepository.replaceById(objectId, materialCategory);
  }

  @del('/material-categories/{id}')
  @response(204, {
    description: 'MaterialCategory DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const objectId = new ObjectId(id);
    await this.materialCategoryRepository.deleteById(objectId);
  }
}

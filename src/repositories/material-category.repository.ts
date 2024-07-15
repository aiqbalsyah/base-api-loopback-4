import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MonggoDbDataSource} from '../datasources';
import {MaterialCategory, MaterialCategoryRelations} from '../models';

export class MaterialCategoryRepository extends DefaultCrudRepository<
  MaterialCategory,
  typeof MaterialCategory.prototype.id,
  MaterialCategoryRelations
> {
  constructor(
    @inject('datasources.MonggoDB') dataSource: MonggoDbDataSource,
  ) {
    super(MaterialCategory, dataSource);
  }
}

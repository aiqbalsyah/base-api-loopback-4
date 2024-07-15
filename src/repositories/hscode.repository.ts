import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MonggoDbDataSource} from '../datasources';
import {Hscode, HscodeRelations} from '../models';

export class HscodeRepository extends DefaultCrudRepository<
  Hscode,
  typeof Hscode.prototype.id,
  HscodeRelations
> {
  constructor(
    @inject('datasources.MonggoDB') dataSource: MonggoDbDataSource,
  ) {
    super(Hscode, dataSource);
  }
}

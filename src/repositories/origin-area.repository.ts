import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MonggoDbDataSource} from '../datasources';
import {OriginArea, OriginAreaRelations} from '../models';

export class OriginAreaRepository extends DefaultCrudRepository<
  OriginArea,
  typeof OriginArea.prototype.id,
  OriginAreaRelations
> {
  constructor(
    @inject('datasources.MonggoDB') dataSource: MonggoDbDataSource,
  ) {
    super(OriginArea, dataSource);
  }
}

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MonggoDbDataSource} from '../datasources';
import {Customer, CustomerRelations} from '../models';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {

  constructor(
    @inject('datasources.MonggoDB') dataSource: MonggoDbDataSource,
  ) {
    super(Customer, dataSource);
  }
}

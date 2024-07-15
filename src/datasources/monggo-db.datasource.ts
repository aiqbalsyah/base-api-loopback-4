import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'MonggoDB',
  connector: 'mongodb',
  url: 'mongodb://apiUser:securePassword123@localhost:27017/base_api',
  host: 'localhost',
  port: 27017,
  user: 'apiUser',
  password: 'securePassword123',
  database: 'base_api',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MonggoDbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'MonggoDB';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.MonggoDB', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

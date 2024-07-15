import {Entity, model, property} from '@loopback/repository';
import {ObjectId} from 'mongodb';
import {Country} from './country.model';
import {User} from './users.model';

@model({
  name: 'origin_areas', // Table name
  settings: {strict: true},
  strictObjectIDCoercion: true,
  idInjection: false,
})
export class OriginArea extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId', },
    generated: true,
  })
  id: ObjectId;

  @property({
    type: 'object',
    required: true,
  })
  country: Partial<Country>;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  code: string;

  @property({
    type: 'number',
    description: '0: inactive, 1: active, 2: suspended',
  })
  status?: number;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'number',
    description: '0: not deleted, 1: deleted',
    default: 0,
  })
  statusDeleted: number;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  @property({
    type: 'object',
  })
  userCreated?: Partial<User>;

  @property({
    type: 'object',
  })
  userUpdated?: Partial<User>;

  @property({
    type: 'object',
  })
  userDeleted?: Partial<User>;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<OriginArea>) {
    super(data);
  }
}

export interface OriginAreaRelations {
  // describe navigational properties here
}

export type OriginAreaWithRelations = OriginArea & OriginAreaRelations;

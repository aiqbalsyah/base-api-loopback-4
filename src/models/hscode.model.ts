import {Entity, model, property} from '@loopback/repository';
import {ObjectId} from 'mongodb';
import {User} from './users.model';

@model({
  name: 'hscodes', // Table name
  settings: {strict: true},
  strictObjectIDCoercion: true,
  idInjection: false,
})
export class Hscode extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId', },
    generated: true,
  })
  id: ObjectId;

  @property({
    type: 'string',
    required: true,
    unique: true,
  })
  code: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
    default: 0,
  })
  bm: number;

  @property({
    type: 'number',
    default: 11,
  })
  ppn: number;

  @property({
    type: 'number',
    default: 11,
  })
  pph: number;

  @property({
    type: 'number',
    default: 0,
  })
  lartas: number;

  @property({
    type: 'number',
    default: 0,
  })
  spiPermit: number;

  @property({
    type: 'number',
    default: 0,
  })
  sni: number;

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


  constructor(data?: Partial<Hscode>) {
    super(data);
  }
}

export interface HscodeRelations {

}

export type HscodeWithRelations = Hscode & HscodeRelations;

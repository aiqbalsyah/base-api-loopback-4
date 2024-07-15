
import {Entity, model, property} from '@loopback/repository';
import {ObjectId} from 'mongodb';
import {BankAccount} from './bank-account.model';
import {Country} from './country.model';
import {OriginArea} from './origin-area.model';
import {User} from './users.model';

@model({
  name: 'suppliers', // Table name
  settings: {strict: true},
  strictObjectIDCoercion: true,
  idInjection: false,
})
export class Supplier extends Entity {
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
  })
  name: string;

  @property({
    type: 'object',
    required: true,
  })
  country: Partial<Country>;

  @property({
    type: 'object',
    required: true,
  })
  originArea: Partial<OriginArea>;

  @property({
    type: 'string',
  })
  initial: string;

  @property({
    type: 'string',
    unique: true,
    required: true,
  })
  code: string;

  @property({
    type: 'string',
    required: true,
  })
  phoneNumber: string;

  @property({
    type: 'string',
  })
  alias: string;

  @property({
    type: 'string',
    required: true,
  })
  pic: string;

  @property({
    type: 'string',
  })
  taxNumber: string;

  @property({
    type: 'string',
    required: true,
  })
  address: string;


  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  imageUrl?: string;

  @property({
    type: 'array',
    itemType: 'object',
  })
  bankAccount?: Partial<BankAccount>[];

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



  constructor(data?: Partial<Supplier>) {
    super(data);
  }
}

export interface SupplierRelations {

}

export type SupplierWithRelations = Supplier & SupplierRelations;

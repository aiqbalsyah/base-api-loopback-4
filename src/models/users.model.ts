import {Entity, model, property} from '@loopback/repository';
import {ObjectId} from 'mongodb';

@model({
  name: 'users',
  settings: {strict: true},
  strictObjectIDCoercion: true,
  idInjection: false,
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId', },
  })
  id: ObjectId;

  @property({
    type: 'string',
    required: true,
  })
  role: string;

  @property({
    type: 'string',
    required: true,
  })
  displayName: string;

  @property({
    type: 'string',
    index: {
      unique: true,
    },
  })
  email: string;

  @property({
    type: 'string',
  })
  password?: string;

  @property({
    type: 'string',
  })
  imageUrl?: string;

  @property({
    type: 'number',
    description: '0: inactive, 1: active, 2: suspended',
  })
  status?: number;

  @property({
    type: 'string',
  })
  otp?: string | null;

  @property({
    type: 'date',
  })
  otpExpired?: Date | null;

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

  @property({
    type: 'string',
  })
  token?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // Describe navigational properties here
}

export type UserWithRelations = User & UserRelations;

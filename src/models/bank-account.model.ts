import {Model, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class BankAccount extends Model {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  accountNumber: string;

  @property({
    type: 'string',
    required: true,
  })
  accountName: string;

  @property({
    type: 'string',
  })
  swiftCode?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<BankAccount>) {
    super(data);
  }
}

export interface BankAccountRelations {
  // describe navigational properties here
}

export type BankAccountWithRelations = BankAccount & BankAccountRelations;

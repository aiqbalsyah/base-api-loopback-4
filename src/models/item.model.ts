import {Entity, model, property} from '@loopback/repository';
import {ObjectId} from 'mongodb';
import {Hscode} from './hscode.model';
import {Supplier} from './supplier.model';
import {User} from './users.model';

interface Name {
  english: string;
  mandarin: string;
  document?: string;
}

interface ItemPicture {
  product?: string;
  packaging?: string;
}

interface ItemDimension {
  length: number;
  width: number;
  height: number;
  volume: number;
}

interface PackagingDetail {
  name: string;
  quantity: number;
  dimension: ItemDimension;
}

interface ItemPrice {
  currency: string;
  base: number;
  selling: number;
  under?: number;
}

@model({
  name: 'items',
  settings: {strict: true},
  strictObjectIDCoercion: true,
  idInjection: false,
})
export class Item extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId', },
    generated: true,
  })
  id: ObjectId;

  @property({
    type: 'object',
    jsonSchema: {
      type: 'object',
      properties: {
        product: {type: 'string'},
        packaging: {type: 'string'},
      },
    },
  })
  picture?: ItemPicture;

  @property({
    type: 'object',
    required: true,
    jsonSchema: {
      type: 'object',
      properties: {
        english: {type: 'string'},
        mandarin: {type: 'string'},
        document: {type: 'string'},
      },
      required: ['english', 'mandarin'],
    },
    default: {
      english: '',
      mandarin: '',
      document: '',
    },
  })
  name: Name;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
  })
  color?: string;

  @property({
    type: 'string',
  })
  remark?: string;

  @property({
    type: 'object',
    required: true,
    jsonSchema: {
      type: 'object',
      properties: {
        length: {type: 'number'},
        width: {type: 'number'},
        height: {type: 'number'},
      },
      required: ['length', 'width', 'height'],
    },
    default: {
      length: 0,
      width: 0,
      height: 0,
    },
  })
  dimension: ItemDimension;

  @property({
    type: 'string',
    name: 'origin_area',
    description: 'NORTH,CENTRAL,WEST',
    default: 'NORTH',
  })
  originArea: string;

  @property({
    type: 'object',
    required: true,
    jsonSchema: {
      type: 'object',
    },
  })
  supplier: Supplier;

  @property({
    type: 'number',
    default: 0,
  })
  packingQty?: number;

  @property({
    type: 'array',
    itemType: 'object',
    jsonSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {type: 'string'},
          quantity: {type: 'number'},
          dimension: {
            type: 'object',
            properties: {
              length: {type: 'number'},
              width: {type: 'number'},
              height: {type: 'number'},
              volume: {type: 'number'},
            },
            required: ['length', 'width', 'height', 'volume'],
          },
        },
        required: ['name', 'quantity', 'dimension'],
      },
    },
    default: [],
  })
  packingDetail?: PackagingDetail[];

  @property({
    type: 'number',
    default: 0,
  })
  qtyPerPacking: number;

  @property({
    type: 'string',
    default: 'pcs',
  })
  unitName: string;

  @property({
    type: 'number',
    default: 0,
  })
  packingVolume: number;

  @property({
    type: 'number',
    default: 0,
  })
  volume: number;

  @property({
    type: 'number',
    default: 0,
  })
  netWeight: number;

  @property({
    type: 'number',
    default: 0,
  })
  grossWeight: number;

  @property({
    type: 'object',
    default: '',
  })
  hscode: Hscode;

  @property({
    type: 'string',
    default: '',
  })
  materialCategory: string;

  @property({
    type: 'string',
    default: '',
  })
  material: string;

  @property({
    type: 'array',
    itemType: 'object',
    jsonSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          currency: {type: 'string'},
          base: {type: 'number'},
          selling: {type: 'number'},
          under: {type: 'number'},
        },
        required: ['currency', 'base', 'selling'],
      },
    },
    default: [],
  })
  price?: ItemPrice[];

  @property({
    type: 'date',
  })
  updatedAt?: Date;


  @property({
    type: 'number',
    name: 'statusDeleted',
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
  userCreated?: {
    id: ObjectId;
    displayName: string;
    email: string;
    imageUrl?: string;
  };

  @property({
    type: 'object',

  })
  userUpdated?: Partial<User>;

  @property({
    type: 'object',

  })
  userDeleted?: Partial<User>;

  constructor(data?: Partial<Item>) {
    super(data);
  }
}

export interface ItemRelations {
  // describe navigational properties here
}

export type ItemWithRelations = Item & ItemRelations;

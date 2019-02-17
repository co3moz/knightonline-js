import { Schema, model, Document, SchemaTypes } from 'mongoose';
import { ICharacterItem } from './character'

export interface IWarehouse extends Document {
  money: number
  items: ICharacterItem[]
}

export const WarehouseSchema = new Schema({
  money: { type: Number, default: 0 },
  items: [{
    id: { type: Number },
    durability: { type: Number },
    amount: { type: Number },
    serial: { type: String },
    expire: { type: Number },
    flag: { type: Number },
    detail: SchemaTypes.Mixed
  }],
}, { timestamps: true });


export const Warehouse = model<IWarehouse>('Warehouse', WarehouseSchema, 'warehouses');
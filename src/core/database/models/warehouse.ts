import { Schema, model, SchemaTypes } from "mongoose";
import type { ICharacterItem } from "./character.js";

export interface IWarehouse {
  money: number;
  items: ICharacterItem[];
}

export const WarehouseSchema = new Schema<IWarehouse>(
  {
    money: { type: Number, default: 0 },
    items: [
      {
        id: { type: Number },
        durability: { type: Number },
        amount: { type: Number },
        serial: { type: String },
        expire: { type: Number },
        flag: { type: Number },
        detail: SchemaTypes.Mixed,
      },
    ],
  },
  { timestamps: true }
);

export const Warehouse = model<IWarehouse>(
  "Warehouse",
  WarehouseSchema,
  "warehouses"
);

import { Schema, model, Document, SchemaTypes } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
  type: string;
}

export const SettingSchema = new Schema(
  {
    key: { type: String },
    value: { type: SchemaTypes.Mixed },
    type: { type: String },
  },
  { timestamps: true }
);

export const Setting = model<ISetting>("Setting", SettingSchema, "settings");

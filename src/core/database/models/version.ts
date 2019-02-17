import { Schema, model, Document } from 'mongoose';

export interface IVersion extends Document {
  version: number
  fileName: string
}

export const VersionSchema = new Schema({
  version: { type: Number, required: true, min: 0, max: 10000 },
  fileName: { type: String, required: true, maxlength: 1000 }
}, { timestamps: false });


export const Version = model<IVersion>('Version', VersionSchema, 'version');


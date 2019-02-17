import { Schema, model, Document } from 'mongoose';

export interface IMail extends Document {
  character: string
  marker: number
  sender: string
  subject: string
  message: string
  type: number
  item: number
  count: number
  durability: number
  serial: string
  money: number
  deleted: boolean
}

export const MailSchema = new Schema({
  character: { type: String, index: true },
  marker: { type: Number },
  sender: { type: String },
  subject: { type: String },
  message: { type: String },
  type: { type: Number },
  item: { type: Number },
  count: { type: Number },
  durability: { type: Number },
  serial: { type: String },
  money: { type: Number },
  deleted: { type: Boolean }
}, { timestamps: true });

export const Mail = model<IMail>('Mail', MailSchema, 'mails');
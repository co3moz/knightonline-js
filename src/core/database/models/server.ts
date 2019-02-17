import { Schema, model, Document } from 'mongoose';

export interface IServer extends Document {
  ip: string
  lanip: string
  name: string
  karusKing: string
  karusNotice: string
  elmoradKing: string
  elmoradNotice: string
  onlineCount: number
  userFreeLimit: number
  userPremiumLimit: number
}

export const ServerSchema = new Schema({
  ip: { type: String },
  lanip: { type: String },
  name: { type: String },
  karusKing: { type: String },
  karusNotice: { type: String },
  elmoradKing: { type: String },
  elmoradNotice: { type: String },

  onlineCount: { type: Number, default: 0 },
  userFreeLimit: { type: Number, default: 3000 },
  userPremiumLimit: { type: Number, default: 3000 }
}, { timestamps: false });

export const Server = model<IServer>('Server', ServerSchema, 'server');
import { Schema, model, Document } from 'mongoose';

export interface INews extends Document {
  title: string
  message: string
}

export const NewsSchema = new Schema({
  title: { type: String, maxlength: 30 },
  message: { type: String, maxlength: 200 }
}, { timestamps: false });

export const News = model<INews>('News', NewsSchema, 'news');


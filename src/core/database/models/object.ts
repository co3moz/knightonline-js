import { Schema, model, Document } from 'mongoose';

export interface IObject extends Document {
  zoneID: number,
  belong: number,
  sIndex: number,
  type: number,
  controlNpcID: number,
  status: number,
  posX: number,
  posY: number,
  posZ: number,
  byLife: number
};

export const ObjectSchema = new Schema({
  zoneID: { type: Number },
  belong: { type: Number },
  sIndex: { type: Number },
  type: { type: Number },
  controlNpcID: { type: Number },
  status: { type: Number },
  posX: { type: Number },
  posY: { type: Number },
  posZ: { type: Number },
  byLife: { type: Number }
}, { timestamps: false });


export const Object = model<IObject>('Object', ObjectSchema, 'objects');

const _cache: IObjectCache = {};

/**
 * Loads Objects to cache. You may call this function before user log in, or objects drop
 * @param objects
 */
export async function PrepareObjects(objects: number[]): Promise<void> {
  let filtered = objects.filter(x => !_cache[x]);

  if (!filtered.length) return;

  let loadedObjects = await Object.find({
    id: { $in: filtered }
  }).lean().select(['-_id', '-sIndex', '-__v']).exec();

  for (let object of loadedObjects) {
    _cache[object.sIndex] = object;
  }
}

export function GetObjectDetail(sIndex: number) {
  return _cache[sIndex];
}

export interface IObjectCache {
  [sIndex: number]: IObject
};

import * as mongoose from 'mongoose'
import DefaultChecker from './utils/default_checker'
import ModelLoader from './utils/model_loader'
import ConnectToDatabase from './utils/connect'

let connection: mongoose.Connection = null;

export default async function Database(): Promise<mongoose.Connection> {
  if (connection) {
    return connection;
  }

  connection = await ConnectToDatabase();

  console.log('loading models...');
  await ModelLoader();


  console.log('checking defaults...');
  await DefaultChecker();

  return connection;
}
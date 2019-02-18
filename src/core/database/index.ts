import * as mongoose from 'mongoose'

import { ConnectToDatabase} from './utils/connect'
import { SettingDefaults, ServerDefaults, SetItemDefaults, ItemDefaults, NpcDefaults, AccountDefaults } from './defaults';

let connection: mongoose.Connection = null;

export async function Database(): Promise<mongoose.Connection> {
  if (connection) {
    return connection;
  }

  connection = await ConnectToDatabase();

  await SettingDefaults();
  await ServerDefaults();
  await SetItemDefaults();
  await ItemDefaults();
  await NpcDefaults();
  await AccountDefaults();

  return connection;
}
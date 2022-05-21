import * as config from 'config'
import * as mongoose from 'mongoose'

import { ConnectToDatabase } from './utils/connect'
import { SettingDefaults, ServerDefaults, SetItemDefaults, ObjectDefaults, ItemDefaults, NpcDefaults, AccountDefaults } from './defaults';

let connection: mongoose.Connection = null;

export async function Database(): Promise<mongoose.Connection> {
  if (connection) {
    return connection;
  }

  connection = await ConnectToDatabase();

  let defaults: any = config.get('defaults');

  if (defaults.setting) await SettingDefaults();
  if (defaults.server) await ServerDefaults();
  if (defaults.set_item) await SetItemDefaults();
  if (defaults.item) await ItemDefaults();
  if (defaults.npc) await NpcDefaults();
  if (defaults.account) await AccountDefaults();
  if (defaults.object) await ObjectDefaults();

  return connection;
}

export function DisconnectFromDatabase(): Promise<void> {
  return mongoose.disconnect();
}
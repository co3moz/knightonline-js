import config from "config";
import mongoose from "mongoose";

import { ConnectToDatabase } from "./utils/connect.js";
import {
  SettingDefaults,
  ServerDefaults,
  SetItemDefaults,
  ItemDefaults,
  NpcDefaults,
  AccountDefaults,
} from "./defaults/index.js";

let connection: mongoose.Connection = null;

export async function Database(): Promise<mongoose.Connection> {
  if (connection) {
    return connection;
  }

  connection = await ConnectToDatabase();

  let defaults: any = config.get("defaults");

  if (defaults.setting) await SettingDefaults();
  if (defaults.server) await ServerDefaults();
  if (defaults.set_item) await SetItemDefaults();
  if (defaults.item) await ItemDefaults();
  if (defaults.npc) await NpcDefaults();
  if (defaults.account) await AccountDefaults();

  return connection;
}

export function DisconnectFromDatabase(): Promise<void> {
  return mongoose.disconnect();
}

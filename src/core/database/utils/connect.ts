import config from "config";
import mongoose from "mongoose";

export async function ConnectToDatabase(): Promise<mongoose.Connection> {
  console.log("[DB] Connecting to database...");

  let connectionUri: string = config.get("database.uri");
  let connectionOptions = Object.assign({}, config.get("database.options"));

  try {
    await mongoose.connect(connectionUri, connectionOptions);
    return mongoose.connection;
  } catch (e) {
    console.log("[DB] Connecting to database failed!");
    console.error(e);
    process.exit(1);
  }
}

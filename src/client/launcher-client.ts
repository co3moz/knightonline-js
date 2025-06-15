import { KOClientFactory, type IKOClientSocket } from "../core/client.js";
import { short, Queue } from "../core/utils/unit.js";

export async function ConnectKOServerForLauncher(
  ip: string,
  port: number,
  version: number = 1299
) {
  let connection: IKOClientSocket;
  let data: Queue;

  try {
    connection = await KOClientFactory({ ip, port, name: "launcher-client" });

    data = await connection.sendAndWait([0x01, ...short(version)], 0x01);

    let latestVersion = data.short();

    data = await connection.sendAndWait([0x02, ...short(version)], 0x02);

    let ftpAddress = data.string();
    let ftpRoot = data.string();
    let totalFiles = data.short();
    let files: string[] = [];

    for (var i = 0; i < totalFiles; i++) {
      files.push(data.string());
    }

    return {
      latestVersion,
      ftpAddress,
      ftpRoot,
      ftpFiles: files,
    };
  } finally {
    if (connection) {
      connection.terminate();
    }
  }
}

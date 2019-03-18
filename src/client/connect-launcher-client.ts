import { KOClientFactory, IKOClientSocket } from '../core/client'
import { short, string, byte_string, Queue } from '../core/utils/unit'
import { PasswordHash } from '../core/utils/password_hash'
import { AuthenticationCode } from '../login_server/endpoints/LOGIN_REQ'

export async function ConnectKOServerForLauncher(ip: string, port: number) {
  let connection: IKOClientSocket;
  let data: Queue;

  try {
    connection = await KOClientFactory({ ip, port, name: 'launcher-test' });

    data = await connection.sendAndWait([0x01, ...short(1299)], 0x01);

    let latestVersion = data.short();

    data = await connection.sendAndWait([0x02, 0x00, 0x00], 0x02);

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
      ftpFiles: files
    }
  } finally {
    if (connection) {
      connection.terminate();
    }
  }
}
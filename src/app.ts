import LoginServer from "./login_server/server";
import GameServer from "./game_server/server";
import { OnServerTick } from "./game_server/events/onServerTick";
import { IKOServer } from "./core/server";
import { Database, DisconnectFromDatabase } from "./core/database";
import { GarbageCollect } from "./core/utils/general";

async function main() {
  console.log('[MAIN] Servers are queued');

  const servers: IKOServer[] = [];
  servers.push(...await LoginServer());
  servers.push(...await GameServer());

  const tick = setInterval(OnServerTick, 250);

  GarbageCollect();

  process.on('SIGINT', CloseSignal.bind(null, 'SIGINT', servers, tick));
  process.on('SIGTERM', CloseSignal.bind(null, 'SIGTERM', servers, tick));
}

async function CloseSignal(signal: string, servers: IKOServer[], tick: NodeJS.Timeout) {
  if (stopping) return;
  stopping = true;
  console.log(`[MAIN] Closing signal came... (${signal})`);

  clearInterval(tick); // stop server ticking..

  for (let server of servers) {
    await server.stop();
  }

  await DisconnectFromDatabase();

  process.exit(0); // safely exited
}

let stopping = false;

main().catch(err => {
  const crashText = ' APP CRASHED ';
  console.error('-'.repeat(15) + crashText + '-'.repeat(15));
  console.error('Date: %s', new Date());
  console.error(err.stack);
  console.error('-'.repeat(30 + crashText.length))
  process.exit(1);
});
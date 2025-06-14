import { LoginServer } from "./login_server/server";
import { GameServer } from "./game_server/server";
import { OnServerTick } from "./game_server/events/onServerTick";
import type { IKOServer } from "./core/server";
import { Database, DisconnectFromDatabase } from "./core/database";
import { GarbageCollect } from "./core/utils/general";
import { WebServer } from "./web/server";
import { RedisConnect } from "./core/redis/connect";

async function main() {
  console.log("[MAIN] %s v%s", "ko-js", "1.0.0");
  await Database();
  await RedisConnect();

  console.log("[MAIN] Servers are queued");

  const servers: IKOServer[] = [];
  servers.push(...(await LoginServer()));
  servers.push(await GameServer());
  await WebServer();

  const tick = setInterval(OnServerTick, 250);

  GarbageCollect();

  let bind = CloseSignal.bind(null, "SIGINT", servers, tick);
  process.on("SIGINT", bind);
  process.on("SIGTERM", bind);
}

async function CloseSignal(
  signal: string,
  servers: IKOServer[],
  tick: NodeJS.Timeout
) {
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

main().catch((err) => {
  const crashText = " APP CRASHED ";
  console.error("-".repeat(15) + crashText + "-".repeat(15));
  console.error("Date: %s", new Date());
  console.error(err.stack);
  console.error("-".repeat(30 + crashText.length));
  process.exit(1);
});

import LoginServer from "./login_server/server";
import GameServer from "./game_server/server";

async function main() {
  console.log('servers are queued');
  await LoginServer();
  await GameServer();
}

main().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
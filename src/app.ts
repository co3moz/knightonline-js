import LoginServer from "./login_server/server";

async function main() {
  console.log('servers are queued');
  await LoginServer();
}

main().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
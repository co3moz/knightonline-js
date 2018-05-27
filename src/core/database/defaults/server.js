module.exports = async function (db) {
  let testServer = {
    ip: '127.0.0.1',
    lanip: '127.0.0.1',
    name: 'TEST|SERVER 1',
    karusKing: 'KARUS KING',
    karusNotice: 'KARUS NOTICE',
    elmoradKing: 'ELMORAD KING',
    elmoradNotice: 'ELMORAD NOTICE'
  }

  let { Server } = db.models;

  let data = await Server.findOne({
    name: testServer.name
  }).exec();

  if (data) {
    return;
  }

  let server = new Server(testServer);

  await server.save();

  console.log('A test server has been defined!')
}
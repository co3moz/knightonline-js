module.exports = async function (db) {
  let testServer = {
    ip: '127.0.0.1',
    lanip: '127.0.0.1',
    name: 'TEST|SERVER',
    karusKing: 'KARUS KING',
    karusNotice: 'KARUS NOTICE',
    elmoradKing: 'ELMORAD KING',
    elmoradNotice: 'ELMORAD NOTICE'
  }

  let { Server } = db.models;

  let data = await Server.findOne({
    name: 'TEST|SERVER'
  }).exec();

  if (data) {
    await data.remove();
  }

  let server = new Server(testServer);

  await server.save();

  console.log('A test server has been defined!')
}
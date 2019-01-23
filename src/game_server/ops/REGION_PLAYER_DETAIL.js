const sendRegionPlayerDetail = require('../functions/sendRegionPlayerDetail');

module.exports = async function ({ body, socket, opcode }) {
  let sessioncount = body.short();
  let sessions = [];

  for (let i = 0; i < sessioncount; i++) {
    sessions.push(body.short());
  }

  sendRegionPlayerDetail(socket, sessions);
}
const unit = require('../../core/utils/unit');
const crypt = require('../../core/utils/crypt');
const config = require('config');

module.exports = async function ({ socket, opcode, body }) {
  let accountName = body.string();
  let password = body.string();

  let status = false;
  if (!(accountName.length > 20 || password.length > 28)) {
    /** TODO: YOU LEFT HERE */
  } 

  socket.pool;

}
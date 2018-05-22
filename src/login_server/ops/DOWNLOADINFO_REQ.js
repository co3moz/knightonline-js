const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, body, versions, opcode }) {
  let downloadSet = [];
  let clientVersion = body.short();

  for (let version of versions) {
    if (version.version > clientVersion) {
      downloadSet.push(unit.string(version.fileName));
    }
  }

  downloadSet.reverse(); // VERSION DESC => ASC

  socket.sendWithHeaders([
    opcode,
    ...unit.config('loginServer.ftp.host'),
    ...unit.config('loginServer.ftp.dir'),
    ...unit.short(downloadSet.length),
    ...[].concat(...downloadSet)
  ]);
}
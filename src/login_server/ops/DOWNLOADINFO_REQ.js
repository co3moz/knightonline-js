const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, data, versions }) {
  let downloadSet = [];
  let clientVersion = unit.readShort(data, 5);

  for (let version of versions) {
    if (version.version > clientVersion) {
      downloadSet.push(unit.string(version.fileName));
    }
  }

  downloadSet.reverse(); // VERSION DESC => ASC

  socket.sendWithHeaders([
    0x2,
    ...unit.config('loginServer.ftp.host'),
    ...unit.config('loginServer.ftp.dir'),
    ...unit.short(downloadSet.length),
    ...[].concat(...downloadSet)
  ]);
}
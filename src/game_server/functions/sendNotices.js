const unit = require('../../core/utils/unit');

let notices = [
  ['KO-JS', 'Welcome to Knight Online Javascript Server']
];

module.exports = socket => {
  let u = socket.user;
  let c = socket.character;

  let nation = u.nation;

  socket.send([
    0x2E,
    2,
    notices.length,
    ...[].concat(...notices.map(notice => [
      ...unit.string(notice[0]),
      ...unit.string(notice[1])
    ]))
  ]);

  socket.send([
    0x2E,
    1,
    notices.length,
    ...[].concat(...notices.map(notice => [
      ...unit.byte_string(notice[1] + ' ' + notice[1])
    ]))
  ]);

  socket.send([
    0x10, // CHAT
    5,
    nation,
    ...unit.short(socket.session & 0xFFFF),
    0,
    ...unit.string(`[SERVER] Server Time: ${new Date().toLocaleString('en-GB')}`)
  ]);

  socket.send([
    0x10, // CHAT
    5,
    nation,
    ...unit.short(socket.session & 0xFFFF),
    0,
    ...unit.string(`[SERVER] Welcome ${c.name}, ko-js is really working :)`)
  ]);
}

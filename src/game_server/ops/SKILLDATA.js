const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, opcode, body }) {
  let subOpcode = body.byte();
  let c = socket.character;

  if (subOpcode == 2) { // load
    if (c.skillBar.length == 0) {
      return socket.send([
        opcode,
        2, // load
        0, 0 // 0
      ])
    }

    return socket.send([
      opcode,
      2, // load
      ...unit.short(c.skillBar.length),
      ...[].concat(...c.skillBar.map(x => unit.int(x)))
    ])
  } else if (subOpcode == 1) { // save
    let count = body.short();
    if (count < 0 || count > 64) {
      return;
    }

    let skills = [];

    for (let i = 0; i < count; i++) {
      skills.push(body.int());
    }

    c.skillBar = skills;
    c.markModified('skillBar');
    await c.save();

    // no need to response
  }
}
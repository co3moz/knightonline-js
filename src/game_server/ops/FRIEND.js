const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, opcode, body }) {
  let subOpcode = body.byte();
  let c = socket.character;
  let map = socket.shared.characterMap;

  switch (subOpcode) {
    case 1: // REQUEST FRIEND LIST
      return socket.sendWithHeaders([
        opcode,
        2,
        ...unit.short(c.friends.length),
        ...[].concat(...c.friends.map(friend => [
          ...unit.string(friend),
          ...unit.short(map[friend] ? map[friend].session : -1),
          map[friend] ? (map[friend].variables.inParty ? 3 : 1) : 0
        ]))
      ]);

    case 3: { // ADD FRIEND
      let newFriendName = body.string();
      let socket = map[newFriendName];
      if (!socket || !socket.character || socket.character.name != newFriendName) {
        return socket.sendWithHeaders([
          opcode,
          3,
          1,
          ...unit.byte_string(newFriendName),
          0xFF, 0xFF,
          0
        ]);
      }

      c.friends.push(newFriendName);
      c.markModified('friends');
      await c.save();

      return socket.sendWithHeaders([
        opcode,
        3,
        0,
        ...unit.byte_string(newFriendName),
        ...unit.short(socket.session),
        socket.variables.inParty ? 3 : 1
      ]);
    }
    case 4: { // REMOVE FRIEND
      let friendName = body.string();
      let index = c.friends.findIndex(friend => friend == friendName);
      if (index == -1) {
        return socket.sendWithHeaders([
          opcode,
          4,
          1,
          ...unit.byte_string(friendName),
          0xFF, 0xFF,
          0
        ]);
      }

      c.friends.splice(index, 1);
      c.markModified('friends');
      await c.save();

      return socket.sendWithHeaders([
        opcode,
        4,
        0,
        ...unit.byte_string(friendName),
        0xFF, 0xFF,
        0
      ]);
    }
  }
}
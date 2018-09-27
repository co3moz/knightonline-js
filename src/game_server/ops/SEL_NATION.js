module.exports = async function ({ socket, opcode, body, db }) {
  let nation = body.byte();

  if (!(nation == 1 || nation == 2)) { // invalid
    return socket.send([
      opcode,
      0
    ]);
  }

  var result = 1;
  try {
    if (!socket.user.warehouse) {
      let { Warehouse } = db.models;
      let warehouse = new Warehouse({ money: 0 });
      await warehouse.save();
      socket.user.warehouse = warehouse._id;
    }

    if (socket.user.characters.length > 0) {
      throw 1; // cant change your nation, if you have a character
    }

    socket.user.nation = nation;
    await socket.user.save();

    result = nation;
  } catch (e) { // if anything goes wrong
    result = 0;
  }

  socket.send([
    opcode,
    result
  ]);
}
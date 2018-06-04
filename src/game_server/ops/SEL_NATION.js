module.exports = async function ({ socket, opcode, body, db }) {
  let nation = body.byte();

  if (!(nation == 1 || nation == 2)) { // invalid
    return socket.sendWithHeaders([
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

    socket.user.nation = nation == 1 ? 'KARUS' : 'ELMORAD';
    await socket.user.save();
    
    result = nation;
  } catch (e) { // if anything goes wrong
    result = 0;
  }

  socket.sendWithHeaders([
    opcode,
    result
  ]);
}
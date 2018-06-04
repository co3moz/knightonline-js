module.exports = async function ({ socket, opcode, body, db }) {
  let unknown = body.byte(); // no idea why
  let charName = body.byte_string(); // byte [char char ...]
  let face = body.byte();
  let hair = body.uint();

  if (!socket.user || !socket.user.characters.find(x => charName)) {
    return socket.sendWithHeaders([
      opcode, 0
    ]);
  }

  var result = 1;
  try {
    let { Character } = db.models;

    let character = await Character.findOne({ name: charName }).exec();
    character.hair = hair;
    character.face = face;
    await character.save();
  } catch (e) {
    console.error('error ocurred on change hair');
    console.error(e.stack);
    result = 0;
  }

  socket.sendWithHeaders([
    opcode, result
  ]);
}
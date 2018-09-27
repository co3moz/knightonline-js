const unit = require('../../core/utils/unit');
const unique = require('../../core/utils/unique');
const ability = require('../utils/ability');

module.exports = async function ({ socket, opcode, body, db }) {
  let session = body.string();
  let charName = body.string();
  let init = body.byte();

  let user = socket.user;
  let { Character, Warehouse, Item } = db.models;

  if (!user || user.session != session) {
    return socket.terminate('illegal access to another account');
  }

  if (user.banned) {
    return socket.terminate('banned account');
  }

  if (!charName) return socket.send([
    opcode, 0
  ]);

  let character = await Character.findOne({
    name: charName
  }).exec();

  if (!character) return socket.send([
    opcode, 0
  ]);

  if (!socket.user.characters.find(x => x == charName)) {
    return socket.send([
      opcode, 0
    ]);
  }

  let shared = socket.shared;
  let characterMap = shared.characterMap;
  let activeSocket = characterMap[charName];
  if (activeSocket && activeSocket != socket) {
    characterMap[charName].terminate('another character select request');
    delete characterMap[charName];

    return socket.send([
      opcode, 0
    ]);
  }

  socket.character = character;
  characterMap[charName] = socket;

  socket.warehouse = await Warehouse.findOne({
    _id: socket.user.warehouse
  }).exec();

  /*if (user.nation == 'KARUS') {
    if (character.zone == 12) character.zone = 11;
    else if (character.zone == 28) character.zone = 18;

    await character.save();
  } else if (user.nation == 'ELMORAD') {
    if (character.zone == 11) character.zone = 12;
    else if (character.zone == 18) character.zone = 28;

    await character.save();
  }*/

  /** TODO: IF WAR IS OVER MOVE CHAR TO CORRECT ZONE */

  if (character.level > 83) {
    return socket.terminate('character level cannot be more than 83');
  }

  /* let starterQuest = character.quests.find(quest => quest.id == questIds.STARTER_SEED_QUEST);
   if (!starterQuest) {
     starterQuest = {
       id: questIds.STARTER_SEED_QUEST,
       state: 1
     };
     character.quest.push(starterQuest);
     await character.save()
   }*/

  // load item details
  for (let item of character.items) {
    if (!item) continue;

    if (!item.detail) {
      let detail = await Item.findOne({ id: item.id }).exec();

      item.detail = detail;
      character.markModified('items');
    }

    if (!item.serial) {
      item.serial = unique();
    }
  }

  /* TODO: RENTAL*/
  // TODO: clan stuff


  socket.variables = {};
  await ability.calculateUserAbilities(socket);
  await character.save();


  socket.send([
    opcode,
    1,
    character.zone,
    ...unit.short(character.x * 10),
    ...unit.short(character.z * 10),
    ...unit.short(character.y * 10),
    1
  ]);
}
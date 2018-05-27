const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, opcode, body, db }) {
  if (!socket.user.characters) {
    socket.user.characters = [];
  }

  var characters = [];

  let { Character } = db.models;
  for (var i = 0; i < 4; i++) {
    let characterId = socket.user.characters[i];

    let data = { 
      name: '',
      hair: 0,
      klass: 0,
      race: 0,
      level: 0,
      face: 0,
      zone: 0
    };

    if (characterId) {
      let character = await Character.findOne({
        _id: characterId
      }).select([
        'name', 'race', 'klass', 'hair', 'level', 'face', 'zone', 'items'
      ]).exec();

      if (character) {
        data.name = character.name;
        data.hair = character.hair;
        data.klass = character.klass;
        data.race = character.race;
        data.level = character.level;
        data.face = character.face;
        data.zone = character.zone;

        var items = [];
        var itemQueue = unit.queue(character.items);

        for (var m = 0; m < 14; m++) {
          if (m == 1 || m == 4 || m == 5 || m == 6 || m == 8 || m == 10 || m == 12 || m == 13) {
            let itemId = itemQueue.uint();
            let durability = itemQueue.short();
            itemQueue.skip(2); // skip count

            items.push([
              ...unit.int(itemId),
              ...unit.short(durability)
            ])
          } else {
            itemQueue.skip(8);
          }
        }

        data.items = [].concat(...items);
      }
    }

    if (!data.items) {
      data.items = Array(6 * 8).fill(0); // (uint + short) * 8 item
    }

    characters.push(data);
  }

  socket.sendWithHeaders([
    opcode,
    1,
    1,
    ...[].concat(...characters.map(character => [
      ...unit.string(character.name),
      character.race,
      ...unit.short(character.klass),
      character.level,
      character.face,
      ...unit.int(character.hair),
      character.zone,
      ...character.items
    ]))
  ])
}
const unit = require('../../core/utils/unit');

module.exports = socket => {
  let quests = socket.character.quests;

  socket.send([
    0x64, // QUEST
    1,
    ...unit.short(quests.length),
    ...[].concat(...quests.map(quest => [
      ...unit.short(quest.id),
      quest.state
    ]))
  ]);
}
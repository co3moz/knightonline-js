exports.module = async (character, id, state) => {
  let quest = character.quests.find(quest => quest.id == id);
  if (quest) {
    return quest.state == state;
  } else {
    return state == 0;
  }
}
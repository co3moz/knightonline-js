const { calculateUserAbilities } = require('../utils/ability');

module.exports = (socket, sendChanges = false) => {
  calculateUserAbilities(socket);

  if (sendChanges) {
    // TODO: do something here..
  }
}
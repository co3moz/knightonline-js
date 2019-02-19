const unit = require('../../core/utils/unit');
const { sendMessageToPlayer } = require('../functions/sendChatMessage');
const region = require('../region');

module.exports = async function ({ body, socket, opcode }) {
  let u = socket.user;
  let c = socket.character;
  let v = socket.variables;

  let willX = body.short();
  let willZ = body.short();
  let willY = body.short();
  let speed = body.short();
  let echo = body.byte();
  let newX = body.short();
  let newZ = body.short();
  let newY = body.short();

  let realX = newX / 10;
  let realZ = newZ / 10;
  let realY = newY / 10;


  let rwillX = willX / 10;
  let rwillZ = willZ / 10;
  let rwillY = willY / 10;

  c.x = realX;
  c.z = realZ;
  c.y = realY;

  // TODO: do this right way :)

  region.update(socket);

  region.regionSend(socket, [
    opcode,
    ...unit.short(socket.session),
    ...unit.short(willX),
    ...unit.short(willZ),
    ...unit.short(willY),
    ...unit.short(speed),
    echo,
    ...unit.short(newX),
    ...unit.short(newZ),
    ...unit.short(newY)
  ]);



  let text = (realX + ' ' + realZ + ' ' + realY + ' | W ' + rwillX + ' ' + rwillZ + ' ' + rwillY + ' | ' + speed);
  console.log('MOVE REAL ' + text);
  sendMessageToPlayer(socket, 7, 'MOVE', text);
}
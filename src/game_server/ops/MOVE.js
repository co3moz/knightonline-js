const unit = require('../../core/utils/unit');
const zoneCodes = require('../var/zone_codes');

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

  c.x = realX;
  c.z = realZ;
  c.y = realY;

  // TODO: do this right way :)

  socket.shared.region.update(socket);

  socket.shared.region.regionSend(socket, [
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

  console.log('MOVE REAL ' + realX + ' ' + realZ + ' '+ realY + ' WILL ' + willX+ ' '+ willZ+ ' '+ willY+ ' ');
}
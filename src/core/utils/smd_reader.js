const fse = require('fs-extra');
const path = require('path');

// for testing use this ->   await require('./core/utils/smd_reader')('elmo2004')
module.exports = async function (file) { // TODO: finish this
  let fd = await fse.open(path.resolve(__dirname, '../../../data/' + file + '.smd'), "r");
  let mapSize = await int(fd);
  let mapUnitDistance = await float(fd);

  let height = await float_array(fd, mapSize * mapSize);
  let mapWidth = (mapSize - 1) * mapUnitDistance;

  if (mapWidth <= 0.0 || mapWidth > 4096 * 16) {
    return null;
  }

  let collisionWidth = await float(fd);
  let collisionLength = await float(fd);


  if (collisionWidth <= 0.0 || collisionWidth > 4096 * 16 ||
    collisionLength <= 0.0 || collisionLength > 4096 * 16) {
    return null;
  }

  if ((mapSize - 1) * mapUnitDistance != collisionWidth) {
    return null;
  }

  let regionX = collisionWidth / 48 + 1;
  let regionZ = collisionWidth / 48 + 1;


  let collisionFaceCount = await int(fd);
  let collisions = [];
  if (collisionFaceCount > 0) {
    let faces = await float_array(fd, 3 /*x, y, z*/ * 3 * collisionFaceCount);
    for (var i = 0; i < collisionFaceCount; i++) {
      collisions.push({ x: faces[i * 3], y: faces[i * 3 + 1], z: faces[i * 3 + 2] });
    }
  }

  let cells = [];
  let z = 0;
  for (let fZ = 0.0; fZ < collisionLength; fZ += 16, z++) {
    let x = 0;
    for (let fX = 0.0; fX < collisionWidth; fX += 16, x++) {
      let bExist = await uint(fd);

      if (!bExist) continue;

      if (!cells[x]) cells[x] = [];
      let cell = {
        shapeCount: 0,
        shapeIndices: null,
        subCells: []
      };

      cell.shapeCount = await int(fd);

      if (cell.shapeCount != 0) {
        cell.shapeIndices = await ushort_array(fd, cell.shapeCount);
      }

      for (let z = 0; z < 4; z++) {
        for (let x = 0; x < 4; x++) {
          if (!cell.subCells[x]) cell.subCells[x] = [];
          let arr = cell.subCells[x];
          let polyCount = await int(fd);
          let verIndices = null;
          if (polyCount != 0) {
            verIndices = await uint_array(fd, polyCount * 3);
          }

          arr[z] = {
            polyCount,
            verIndices
          }
        }
      }

      cells[x][z] = cell;

    }
  }

  let eventObjectCount = await int(fd);
  let eventObjects = [];

  for (let i = 0; i < eventObjectCount; i++) {
    let buf = await read_array(fd, 24);
    eventObjects.push({
      index: buf.readInt32LE(0),
      zoneId: buf.readUInt16LE(4),
      belong: buf.readInt32LE(6),
      nindex: buf.readInt16LE(10),
      type: buf.readInt16LE(12),
      controlNpcId: buf.readInt16LE(14),
      status: buf.readInt16LE(16),
      x: buf.readFloatLE(18),
      /*y: buf.readFloatLE(22),
      z: buf.readFloatLE(26),
      byLife: buf.readUInt8(30),*/
    })
  }

  let ppn = await short_array(fd, mapSize * mapSize);
  console.timeEnd("time");
  console.log(file + '.smd map size ' + mapSize + ' unit distance ' + mapUnitDistance);
}


async function int(fd) {
  let buf = Buffer.allocUnsafe(4);
  await fse.read(fd, buf, 0, 4);
  return buf.readInt32LE(0);
}

async function uint(fd) {
  let buf = Buffer.allocUnsafe(4);
  await fse.read(fd, buf, 0, 4);
  return buf.readUInt32LE(0);
}

async function ushort(fd) {
  let buf = Buffer.allocUnsafe(2);
  await fse.read(fd, buf, 0, 2);
  return buf.readUInt16LE(0);
}

async function float(fd) {
  let buf = Buffer.allocUnsafe(4);
  await fse.read(fd, buf, 0, 4);
  return buf.readFloatLE(0);
}

async function read_array(fd, bytes) {
  let buf = Buffer.allocUnsafe(bytes);
  await fse.read(fd, buf, 0, bytes);
  return buf;
}

async function float_array(fd, size) {
  let buf = await read_array(fd, 4 * size);
  let array = [];
  for (var i = 0; i < size; i++) array.push(buf.readFloatLE(i * 4));
  return array;
}

async function uint_array(fd, size) {
  let buf = await read_array(fd, 4 * size);
  let array = [];
  for (var i = 0; i < size; i++) array.push(buf.readUInt32LE(i * 4));
  return array;
}


async function ushort_array(fd, size) {
  let buf = await read_array(fd, 2 * size);
  let array = [];
  for (var i = 0; i < size; i++) array.push(buf.readUInt16LE(i * 2));
  return array;
}

async function short_array(fd, size) {
  let buf = await read_array(fd, 2 * size);
  let array = [];
  for (var i = 0; i < size; i++) array.push(buf.readInt16LE(i * 2));
  return array;
}
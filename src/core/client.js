const net = require('net');
const unit = require('./utils/unit');
const lzfjs = require('lzfjs');
const crc32 = require('crc-32');

module.exports = (params) => {
  let { ip, port, debug, onConnected, name } = params;

  var debugFn;

  if (!debug) {
    debugFn = () => { }
  } else if (debug === true) {
    debugFn = (...params) => console.log('DEBUG (client:' + name + ')', ...params);
  }


  return new Promise(async (resolve, reject) => {
    const client = new net.Socket();
    client.debug = debugFn;
    client.connected = false;

    let waitingTasks = [];
    let waitingSignals = [];

    client.waitNextData = function (opcode, subopcode) {
      var task = Task();
      task.opcode = opcode;
      task.subopcode = subopcode;


      for (let i = 0; i < waitingSignals.length; i++) {
        if (opcode) {
          if (waitingSignals[i][0] == opcode) {
            if (subopcode) {
              if (waitingSignals[i][1] == subopcode) {
                task.resolve(unit.queue(waitingSignals[i].slice(2)));
                waitingSignals.splice(i, 1);
                return task;
              }
            } else {
              task.resolve(unit.queue(waitingSignals[i].slice(1)));
              waitingSignals.splice(i, 1);
              return task;
            }
          }
        } else {
          task.resolve(unit.queue(waitingSignals[i]));
          waitingSignals.splice(i, 1);
          return task;
        }
      }

      waitingTasks.push(task);
      return task;
    }

    client.terminate = message => {
      if (message) client.debug(message);
      client.end();
    }

    client.send = function (response) {
      client.writeb([0xAA, 0x55, ...unit.short(response.length), ...response, 0x55, 0xAA]);
    }

    client.sendAndWait = function (data, opcode, subopcode) {
      client.send(data);
      return client.waitNextData(opcode, subopcode);
    }

    client.getWaitingSignals = function () {
      let w = waitingSignals;
      waitingSignals = [];
      return w;
    }

    client.writeb = (data) => {
      if (debug) {
        client.debug('data out | ' + data.map(x => x.toString(16).padStart(2, '0').toUpperCase()).join(' '));
      }

      client.write(Buffer.from(data));
    }

    client.connect(port, ip, function () {
      client.connected = true;
      if (debug) {
        client.debug('Connected at ' + ip + ':' + port);
      }
      if (onConnected) onConnected(client);
      resolve(client);
    });

    let frag = [];
    let fragCount = 0;

    client.on('data', function (data) {
      if (debug) {
        client.debug('data in | ' + Array.from(data).map(x => x.toString(16).padStart(2, '0').toUpperCase()).join(' '));
      }

      if (frag.length > 0) {
        data = Buffer.concat([frag, data]);
        fragCount++;
      }

      while (data.length > 0) { // multiple data control
        let length = unit.readShort(data, 2);

        if (doesProtocolHeaderValid(data)) return client.terminate('invalid protocol begin')
        if (doesProtocolFooterValid(data, length)) {
          if (fragCount > 10) {
            return client.terminate('too much fragmentation not allowed');
          }
          frag = data;
          return;
        }

        if (frag.length > 0) {
          frag = [];
          fragCount = 0;
        }

        let onlyBody;
        let opcode = data[4];
        let subopcode = data[5];
        let didSent = false;

        if (opcode == 0x42) { // COMPRESSED_PACKAGE
          const body = unit.queue(data.slice(5, 4 + length));
          let len = body.int();
          let realLen = body.int();
          let crc = body.int();
          let compressedData = body.skip(len);
          let uncompressedData = lzfjs.decompress(new Uint8Array(compressedData));
          let crcUncompressedData = crc32.buf(uncompressedData, ~-1);
          if (crcUncompressedData != crc || uncompressedData.length != realLen || compressedData.length != len) {
            throw new Error('invalid compressed data!');
          }

          data = [0xAA, 0x55, ...unit.short(realLen), ...Array.from(uncompressedData), 0x55, 0xAA, ...data.slice(6 + length)]
          client.debug('data uncompressed | ' + Array.from(data).map(x => x.toString(16).padStart(2, '0').toUpperCase()).join(' '));
          opcode = data[4];
          subopcode = data[5];
          length = realLen;
        }


        for (let i = 0; i < waitingTasks.length; i++) {
          let task = waitingTasks[i];
          if (task.opcode) {
            if (opcode != task.opcode) continue;
            if (task.subopcode) {
              if (subopcode != task.subopcode) continue;

              onlyBody = data.slice(6, 4 + length); // opcode and subopcode are not required to send
            } else {
              onlyBody = data.slice(5, 4 + length); // opcode is not required to send
            }
          } else {
            onlyBody = data.slice(4, 4 + length);
          }

          didSent = true;
          const body = unit.queue(onlyBody);
          task.resolve(body);
          waitingTasks.splice(i, 1);
          break;
        }

        if (!didSent) {
          onlyBody = data.slice(4, 4 + length);
          waitingSignals.push(onlyBody);
        }


        data = data.slice(6 + length);
      }
    });

    client.on('error', function (err) {
      if (debug) {
        client.debug('error', err);
      }
    })

    client.on('close', function () {
      client.connected = false;
      console.log('Connection closed');

      for (let i of waitingTasks) {
        i.reject(new Error('connection is closed!'));
      }
    });
  });
}


function Task() {
  var resolve, reject;
  var promise = new Promise((a, b) => (resolve = a, reject = b));
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

function doesProtocolHeaderValid(data) {
  return data[0] != 0xAA || data[1] != 0x55;
}

function doesProtocolFooterValid(data, length) {
  return data[4 + length] != 0x55 || data[5 + length] != 0xAA
}
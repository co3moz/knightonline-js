const net = require('net');
const unit = require('./utils/unit');
const uniqueQueue = require('./utils/unique_queue');
const lzfjs = require('lzfjs');
const crc32 = require('crc-32');

/**
 * Creates a tcp server
 * @param {object} Builder Object
 */
module.exports = (params, shared) => {
  let { debug, ports, ip } = params;

  if (!shared) {
    shared = {};
  }

  return new Promise(async (resolve, reject) => {
    var debugFn;

    if (!debug) {
      debugFn = function () { }
    } else if (debug === true) {
      debugFn = function (...params) {
        console.log('DEBUG (%s|session:%d)', this.remoteAddress, this.session, ...params);
      }
    } else {
      debugFn = debug;
    }

    shared.debug = debugFn;

    try {
      await Promise.all(ports.map(function (port) {
        return new Promise(resolve => {
          var server = net.createServer(serverHandler(params, shared));

          server.maxConnections = 3000;

          server.port = port;
          server.shared = shared;

          server.listen(port, ip, function () {
            resolve(server);
          });
        });
      }));

      if (ports.length == 1) {
        console.log('server started at ' + ip + ':' + ports[0] + '!');
      } else {
        console.log('servers started at ' + ip + ':' + ports.join(', ') + '!');
      }
    } catch (e) {
      reject(e);
    }

    resolve();
  });
}

function serverHandler({ timeout, onConnect, onData, onError, debug, onDisconnect }, shared) {
  let idPool = uniqueQueue(3000);
  let ipPool = {};

  return socket => {
    var session = socket.session = idPool.reserve();
    if (!session) {
      socket.end(); // no new connections!
      return;
    }

    if (ipPool[socket.remoteAddress]) {
      if (ipPool[socket.remoteAddress] > 5) {
        socket.end(); // no new connections!
        return;
      }

      ipPool[socket.remoteAddress]++;
    } else {
      ipPool[socket.remoteAddress] = 1;
    }

    socket.connectedAt = Date.now();
    socket.shared = shared;
    socket.debug = shared.debug;
    socket.setTimeout(timeout || 60000);

    socket.send = function (response) {
      socket.writeb([0xAA, 0x55, ...unit.short(response.length), ...response, 0x55, 0xAA]);
    }

    socket.sendCompressed = function (response) {
      let crc = crc32.buf(response, ~-1);
      let compressed = lzfjs.compress(response);

      socket.send([
        0x42, // COMPRESSED_PACKAGE
        ...unit.int(compressed.length),
        ...unit.int(response.length),
        ...unit.int(crc),
        ...compressed
      ]);
    }

    socket.writeb = (data) => {
      if (debug) {
        socket.debug('data out | ' + data.map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
      }

      socket.write(Buffer.from(data));
    }

    socket.terminate = message => {
      socket.debug(message);
      socket.end();

      return socket.terminatePromise = derived();
    }

    socket.on('timeout', () => {
      socket.debug('socket timeout');
      socket.end();
    });

    socket.debug('new connection');
    if (onConnect) onConnect(socket);


    if (onData) {
      let queue = [];
      socket.on('data', async data => {
        let p = derived();
        queue.push(p);
        if (queue.length > 1) {
          await queue[queue.length - 2];
        }

        if (queue.length > 100) {
          queue = [];
          return socket.terminate('too much request');
        }

        if (debug) {
          socket.debug('data in | ' + Array.from(data).map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
        }

        try {
          let maxLoop = 10;
          while (data.length > 0 && maxLoop-- > 0) { // multiple data
            let time = Date.now();
            if (doesProtocolHeaderValid(data)) return socket.terminate('invalid protocol begin')
            const length = unit.readShort(data, 2);
            if (doesProtocolFooterValid(data, length)) return socket.terminate('invalid protocol end');

            let onlyBody;

            // if (socket.cryption) {
            //   onlyBody = socket.cryption.decrypt(data.slice(4, 5 + length));
            //   opcode = onlyBody.shift();
            // } else {
            onlyBody = data.slice(5, 4 + length);
            // }

            let body = unit.queue(onlyBody);
            let opcode = data[4];


            if (onData) await onData({ body, socket, opcode, length });
            data = data.slice(6 + length);
            socket.debug('It took ' + (Date.now() - time) + 'ms to handle 0x' + (opcode ? (opcode < 16 ? "0" : "") + opcode.toString(16) : 'null'));
          }
        } catch (e) {
          console.error(e.stack);
          console.log('onData has some error that did not catched before!');
        }

        queue.shift().resolve();
      });
    }

    socket.on('close', async () => {
      if (onDisconnect) await onDisconnect(socket);
      socket.debug('connection closed');

      if (socket.terminatePromise) {
        socket.terminatePromise.resolve();
      }

      idPool.free(session);

      if (ipPool[socket.remoteAddress] <= 1) {
        delete ipPool[socket.remoteAddress]
      } else {
        ipPool[socket.remoteAddress]--;
      }
    });

    socket.on('error', error => {
      if (onError) onError(error, socket);
    });
  }
}


function doesProtocolHeaderValid(data) {
  return data[0] != 0xAA || data[1] != 0x55;
}

function doesProtocolFooterValid(data, length) {
  return data[4 + length] != 0x55 || data[5 + length] != 0xAA
}

function derived() {
  let resolve, reject;
  let promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}
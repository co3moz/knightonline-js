const net = require('net');
const unit = require('./utils/unit');

/**
 * Creates a tcp server
 * @param {object} Builder Object
 */
module.exports = (params) => {
  let { debug, ports, ip } = params;

  return new Promise(async (resolve, reject) => {
    var debugFn;

    if (!debug) {
      debugFn = function () { }
    } else if (debug === true) {
      debugFn = (session, ...params) => console.log('DEBUG (session:%d)', session, ...params);
    } else {
      debugFn = debug;
    }

    var shared = { id: 0, debugFn, pool: {} };

    try {
      await Promise.all(ports.map(function (port) {
        return new Promise(resolve => {
          var server = net.createServer(serverHandler(params, shared));

          server.maxConnections = 3000;

          server.port = port;
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
  return socket => {
    var session = socket.session = shared.id++;
    shared.pool[session] = socket;
    socket.shared = shared;

    socket.sendWithHeaders = function (response) {
      socket.writeb([0xAA, 0x55, ...unit.short(response.length), ...response, 0x55, 0xAA]);
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
    }

    socket.debug = (...params) => shared.debugFn(session, ...params);

    socket.setTimeout(timeout || 60000);
    socket.on('timeout', () => {
      socket.debug(session, 'socket timeout');
      socket.end();
    });

    socket.debug('new connection');
    if (onConnect) onConnect(socket);


    if (onData) {
      socket.on('data', async data => {
        if (debug) {
          socket.debug('data in | ' + Array.from(data).map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
        }

        try {
          while (data.length > 0) { // multiple data
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
            socket.debug('It took ' + (Date.now() - time) + 'ms to handle 0x' + (opcode < 16 ? "0" : "") + opcode.toString(16));
          }
        } catch (e) {
          console.error(e.stack);
          console.log('onData has some error that did not catched before!');
        }
      });
    }

    socket.on('close', () => {
      if (onDisconnect) onDisconnect(socket);
      socket.debug('connection closed');
      delete shared.pool[session];
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
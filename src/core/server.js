const net = require('net');

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
    }

    var shared = { id: 0, debugFn };

    try {
      await Promise.all(ports.map(function (port) {
        return new Promise(resolve => {
          var server = net.createServer(serverHandler(params, shared));

          server.maxConnections = 3000;

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

function serverHandler({ onConnected, onData, onError, debug, sendWithHeaders }, shared) {
  return socket => {
    var session = socket.session = shared.id++;

    socket.sendWithHeaders = sendWithHeaders.bind(socket);

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

    socket.setTimeout(60000);
    socket.on('timeout', () => {
      socket.debug(session, 'socket timeout');
      socket.end();
    });

    socket.debug(session, 'new connection');
    if (onConnected) onConnected(socket);


    if (onData) {
      socket.on('data', data => {
        socket.debug('data in | ' + Array.from(data).map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));

        try {
          onData(data, socket);
        } catch (e) {
          console.error(e);
          console.log('onData has some error that did not catched before!');
        }
      });
    }

    socket.on('error', error => {
      if (onError) onError(error, socket);
    });
  }
}
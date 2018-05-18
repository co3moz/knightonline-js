const net = require('net');

/**
 * Creates a tcp server
 * @param {object} Builder Object
 */
module.exports = ({ ip, port, onConnected, onData, onError, debug, sendWithHeaders }) => {
  return new Promise(resolve => {
    var id = 0;


    if (!debug) {
      debug = function () { }
    } else if (debug === true) {
      debug = (session, ...params) => console.log('DEBUG (session:%d)', session, ...params);
    }

    var server = net.createServer(socket => {
      var session = socket.session = ++id;

      socket.sendWithHeaders = sendWithHeaders.bind(socket);

      socket.writeb = (data) => {
        socket.write(Buffer.from(data));
      }

      socket.debug = (...params) => debug(session, ...params);

      socket.setTimeout(60000);
      socket.on('timeout', () => {
        debug(session, 'socket timeout');
        socket.end();
      });

      debug(session, 'new connection');
      if (onConnected) onConnected(socket);


      if (onData) {
        socket.on('data', data => {
          onData(data, socket);
        });
      }

      socket.on('error', error => {
        if (onError) onError(error, socket);
      });
    });

    server.maxConnections = 3000;

    server.listen(port, ip, function () {
      console.log('server started at ' + ip + ':' + port + '!');
      resolve(server);
    });
  });
}

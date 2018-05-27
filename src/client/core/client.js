const net = require('net');
const unit = require('../../core/utils/unit');

module.exports = (params) => {
  let { ip, port, debug, onConnected } = params;

  var debugFn;

  if (!debug) {
    debugFn = function () { }
  } else if (debug === true) {
    debugFn = (...params) => console.log('DEBUG (session:CLIENT)', ...params);
  }


  return new Promise(async (resolve, reject) => {
    const client = new net.Socket();
    client.debug = debugFn;

    let waitingTasks = [];
    client.waitNextData = function () {
      var task = Task();
      waitingTasks.push(task);
      return task;
    }

    client.terminate = message => {
      client.debug(message);
      client.end();
    }

    client.sendWithHeaders = function (response) {
      client.writeb([0xAA, 0x55, ...unit.short(response.length), ...response, 0x55, 0xAA]);
    }

    client.sendAndWait = function (data) {
      client.sendWithHeaders(data);
      return client.waitNextData();
    }

    client.writeb = (data) => {
      if (debug) {
        client.debug('data out | ' + data.map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
      }

      client.write(Buffer.from(data));
    }

    client.connect(port, ip, function () {
      debugFn('Connected');
      if (onConnected) onConnected(client);
      resolve(client);
    });

    client.on('data', function (data) {
      if (debug) {
        client.debug('data in | ' + Array.from(data).map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
      }

      const length = unit.readShort(data, 2);

      if (doesProtocolHeaderValid(data)) return client.terminate('invalid protocol begin')
      if (doesProtocolFooterValid(data, length)) return client.terminate('invalid protocol end');

      const onlyBody = data.slice(4, 4 + length);

      for (var i = 0; i < waitingTasks.length; i++) {
        const body = unit.queue(onlyBody);
        waitingTasks[i].resolve(body);
      }

      waitingTasks = [];
    });

    client.on('error', function (err) {
      if (debug) {
        client.debug('error', err);
      }
    })

    client.on('close', function () {
      debugFn('Connection closed');
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
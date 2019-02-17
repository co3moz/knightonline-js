import * as net from 'net';
import { Queue, int, short, readShort } from './utils/unit';
import { CreateDeferredPromise, IDeferredPromise } from './utils/deferred_promise';
import uniqueQueue from './utils/unique_queue';
import lzfjs from 'lzfjs';
import * as crc32 from 'crc-32';
import Crypt from './utils/crypt';

export async function ServerFactory(params: IServerConfiguration): Promise<net.Server[]> {
  let { ip, ports } = params;

  if (!params.ipPool) {
    params.ipPool = {};
  }

  let servers = await Promise.all(ports.map(port => new Promise(resolve => {
    var server = net.createServer(serverHandler(params));

    server.maxConnections = 10000;

    server.listen(port, ip, function () {
      resolve(server);
    });
  })));

  if (ports.length == 1) {
    console.log('server started at ' + ip + ':' + ports[0] + '!');
  } else {
    console.log('servers started at ' + ip + ':' + ports[0] + '-' + ports[ports.length - 1] + '!');
  }

  return <net.Server[]>servers;
}

function serverHandler(params: IServerConfiguration) {
  let { timeout, onConnect, onData, onError, onDisconnect, ipPool } = params;
  let idPool = uniqueQueue(3000);

  return (socket: ISocket) => {
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
    socket.setTimeout(timeout);

    socket.send = response => {
      if (response.length > 800) {
        let crc = crc32.buf(response, ~-1);
        let compressed = lzfjs.compress(response);

        response = [
          0x42, // COMPRESSED_PACKAGE
          ...int(compressed.length),
          ...int(response.length),
          ...int(crc),
          ...compressed
        ];
      }

      socket.write(Buffer.from([0xAA, 0x55, ...short(response.length), ...response, 0x55, 0xAA]));
    }

    socket.terminate = message => {
      socket.end();

      return socket.terminatePromise = CreateDeferredPromise();
    }

    socket.on('timeout', () => {
      socket.end();
    });

    if (onConnect) onConnect(socket);

    if (onData) {
      let queue = [];
      socket.on('data', async data => {
        let deferredPromise = CreateDeferredPromise();
        queue.push(deferredPromise);

        if (queue.length > 1) {
          await queue[queue.length - 2];
        }

        if (queue.length > 100) {
          queue = [];
          return socket.terminate('too much request');
        }

        try {
          let maxLoop = 10;
          while (data.length > 0 && maxLoop-- > 0) { // multiple data
            if (doesProtocolHeaderValid(data)) return socket.terminate('invalid protocol begin')
            const length = readShort(data, 2);
            if (doesProtocolFooterValid(data, length)) return socket.terminate('invalid protocol end');

            let onlyBody = data.slice(4, 4 + length);

            if (socket.cryption) {
              socket.cryption.decode(onlyBody);
            }

            if (onData) await onData(socket, onlyBody);
            data = data.slice(6 + length);
            // socket.debug('It took ' + (Date.now() - time) + 'ms to handle 0x' + (opcode ? (opcode < 16 ? "0" : "") + opcode.toString(16) : 'null'));
          }
        } catch (e) {
          console.error(e.stack);
          console.error('onData has some error that did not catched before!');
        }

        queue.shift().resolve();
      });
    }

    socket.on('close', async () => {
      if (onDisconnect) await onDisconnect(socket);

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
      if (onError) onError(socket, error);
    });
  }
}


const doesProtocolHeaderValid = (data) => {
  return data[0] != 0xAA || data[1] != 0x55;
}

const doesProtocolFooterValid = (data, length) => {
  return data[4 + length] != 0x55 || data[5 + length] != 0xAA
}

export interface ISocket extends net.Socket {
  session: number
  connectedAt: number
  send: (packet: Array<number>) => void
  terminate: (message: string) => IDeferredPromise
  terminatePromise: IDeferredPromise
  cryption?: Crypt
}

export interface IServerConfiguration {
  ip: string
  ports: number[]
  timeout?: number
  ipPool?: object
  onConnect?: (socket: ISocket) => void
  onData?: (socket: ISocket, data: Buffer) => Promise<void>
  onError?: (socket: ISocket, error: Error) => void
  onDisconnect?: (socket: ISocket) => Promise<void>
}

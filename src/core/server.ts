import net from "net";
import { int, short, readShort } from "./utils/unit.js";
import {
  CreateDeferredPromise,
  type IDeferredPromise,
} from "./utils/deferred_promise.js";
import { UniqueQueue } from "./utils/unique_queue.js";
import lzfjs from "lzfjs";
import crc32 from "crc-32";
import { Crypt } from "./utils/crypt.js";

export async function KOServerFactory(
  params: IServerConfiguration
): Promise<IKOServer[]> {
  let { ip, ports } = params;

  if (!params.ipPool) {
    params.ipPool = {};
  }

  if (!params.idPool) {
    params.idPool = UniqueQueue.from(3000);
  }

  if (!params.connections) {
    params.connections = {};
  }

  let servers = await Promise.all(
    ports.map(
      (port) =>
        new Promise((resolve) => {
          var server = <IKOServer>net.createServer(serverHandler(params));

          server.maxConnections = 10000;
          server.params = params;

          let stopping = false;
          server.stop = () => {
            if (stopping) return;
            stopping = true;
            params.stopping = true;

            let promise = <any>Promise.all([
              new Promise((resolve) => server.close(resolve)),
              (async () => {
                if (params.onStop) {
                  await params.onStop(server);
                }

                for (let socket of server.querySocketList()) {
                  await socket.terminate(); // make sure client disconnect
                }

                console.log(
                  "[SERVER] Server stopped! (" + ip + ":" + port + ")"
                );
              })(),
            ]);

            return promise;
          };

          server.querySocketList = () => {
            let sockets = [];
            let c = params.connections;
            for (let session in c) {
              sockets.push(c[session]);
            }

            return sockets;
          };

          server.listen(port, ip, function () {
            resolve(server);
          });
        })
    )
  );

  if (ports.length == 1) {
    console.log("[SERVER] Server started! (" + ip + ":" + ports[0] + ")");
  } else {
    console.log(
      "[SERVER] Servers started! (" +
        ip +
        ":" +
        ports[0] +
        "-" +
        ports[ports.length - 1] +
        ")"
    );
  }

  return <IKOServer[]>servers;
}

function serverHandler(params: IServerConfiguration) {
  let {
    timeout,
    onConnect,
    onData,
    onError,
    onDisconnect,
    ipPool,
    idPool,
    connections,
  } = params;

  return (socket: IKOSocket) => {
    let session = (socket.session = idPool.reserve());

    if (!session) {
      socket.end(); // no new connections!
      return;
    }

    socket.setNoDelay(true);

    if (ipPool[socket.remoteAddress]) {
      if (ipPool[socket.remoteAddress] > 5) {
        socket.end(); // no new connections!
        return;
      }

      ipPool[socket.remoteAddress]++;
    } else {
      ipPool[socket.remoteAddress] = 1;
    }

    connections[session] = socket;

    socket.connectedAt = Date.now();
    socket.setTimeout(timeout);

    socket.send = (response) => {
      if (response.length > 800) {
        let crc = crc32.buf(response, ~-1);
        let compressed = lzfjs.compress(response);

        response = [
          0x42, // COMPRESSED_PACKAGE
          ...int(compressed.length),
          ...int(response.length),
          ...int(crc),
          ...compressed,
        ];
      }

      socket.write(
        Buffer.from([
          0xaa,
          0x55,
          ...short(response.length),
          ...response,
          0x55,
          0xaa,
        ])
      );
    };

    socket.terminate = (message) => {
      if (message) {
        console.log(
          '[SOCKET] Terminated because of "' +
            message +
            '" session: ' +
            session +
            " from: " +
            socket.remoteAddress
        );
      }
      socket.end();

      return (socket.terminatePromise = CreateDeferredPromise());
    };

    socket.on("timeout", () => {
      socket.end();
    });

    if (onConnect) onConnect(socket);

    if (onData) {
      let queue: IDeferredPromise[] = [];
      socket.on("data", async (data) => {
        if (params.stopping) return; // stop new requests

        let deferredPromise = CreateDeferredPromise();
        queue.push(deferredPromise);

        if (queue.length > 1) {
          await queue[queue.length - 2];
        }

        if (queue.length > 100) {
          queue = [];
          return socket.terminate("too much request");
        }

        if (params.stopping) return; // stop queue requests

        try {
          let maxLoop = 10;
          while (data.length > 0 && maxLoop-- > 0) {
            // multiple data
            if (doesProtocolHeaderValid(data))
              return socket.terminate("invalid protocol begin");
            const length = readShort(data, 2);
            if (doesProtocolFooterValid(data, length))
              return socket.terminate("invalid protocol end"); // client always sends small packets. it will never be splitted packets

            let onlyBody = data.slice(4, 4 + length);

            if (socket.cryption) {
              socket.cryption.decode(onlyBody);
            }

            if (onData) await onData(socket, onlyBody);
            data = data.slice(6 + length);
            // socket.debug('It took ' + (Date.now() - time) + 'ms to handle 0x' + (opcode ? (opcode < 16 ? "0" : "") + opcode.toString(16) : 'null'));
          }
        } catch (e) {
          console.error(
            "[SERVER] onData has some error that did not catched before!"
          );
          console.error(e.stack);
        }

        queue.shift().resolve();
      });
    }

    socket.on("close", async () => {
      delete connections[session];
      if (onDisconnect) await onDisconnect(socket);

      if (socket.terminatePromise) {
        socket.terminatePromise.resolve();
      }

      idPool.free(session);

      if (ipPool[socket.remoteAddress] <= 1) {
        delete ipPool[socket.remoteAddress];
      } else {
        ipPool[socket.remoteAddress]--;
      }
    });

    socket.on("error", (error) => {
      if (onError) onError(socket, error);
    });
  };
}

const doesProtocolHeaderValid = (data) => {
  return data[0] != 0xaa || data[1] != 0x55;
};

const doesProtocolFooterValid = (data, length) => {
  return data[4 + length] != 0x55 || data[5 + length] != 0xaa;
};

export interface IKOSocket extends net.Socket {
  session: number;
  connectedAt: number;
  send: (packet: number[]) => void;
  terminate: (message?: string) => IDeferredPromise;
  terminatePromise: IDeferredPromise;
  cryption?: Crypt;
  context?: any;
}

export interface IServerConfiguration {
  ip: string;
  ports: number[];
  timeout: number;
  ipPool?: object;
  idPool?: UniqueQueue;
  connections?: object; // {session: socket} holder
  stopping?: boolean; // if stopping, ignore all packages..
  onConnect?: (socket: IKOSocket) => void;
  onData?: (socket: IKOSocket, data: Buffer) => Promise<void>;
  onError?: (socket: IKOSocket, error: Error) => void;
  onDisconnect?: (socket: IKOSocket) => Promise<void>;
  onStop?: (server: IKOServer) => Promise<void>;
}

export interface IKOServer extends net.Server {
  stop: () => Promise<void>;
  querySocketList: () => IKOSocket[];
  params: IServerConfiguration;
}

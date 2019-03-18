import * as net from 'net'
import * as lzfjs from 'lzfjs'
import * as crc32 from 'crc-32'
import { Queue, short, readShort } from './utils/unit'
import { CreateDeferredPromise, IDeferredPromise } from './utils/deferred_promise'

export function KOClientFactory(params: IClientConfiguration): Promise<IKOClientSocket> {
  let { ip, port, onConnect } = params;

  return new Promise(async (resolve, reject) => {
    const client = <IKOClientSocket>new net.Socket();
    client.connected = false;

    let waitingTasks: IWaitingTaskPromise[] = [];
    let waitingSignals: Buffer[] = [];

    let resolveWaitingTask = (task: IWaitingTaskPromise, i: number, n: number) => {
      task.resolve(Queue.from(waitingSignals[i].slice(n)));
      waitingSignals.splice(i, 1);
      return task;
    }

    client.waitNextData = function (opcode: number, subopcode: number, timeout: number): IWaitingTaskPromise {
      let task = <IWaitingTaskPromise>CreateDeferredPromise(timeout);
      task.opcode = opcode;
      task.subopcode = subopcode;

      for (let i = 0; i < waitingSignals.length; i++) {
        if (opcode) {
          if (waitingSignals[i][0] == opcode) {
            if (subopcode) {
              if (waitingSignals[i][1] == subopcode) return resolveWaitingTask(task, i, 2);
            } else return resolveWaitingTask(task, i, 1);
          }
        } else return resolveWaitingTask(task, i, 0);
      }

      waitingTasks.push(task);
      return task;
    }

    client.terminate = (message: string) => {
      console.error('[CLIENT ERROR] %s', message);
      client.end();
    }

    client.send = response => {
      client.write(Buffer.from([0xAA, 0x55, ...short(response.length), ...response, 0x55, 0xAA]));
    }

    client.sendAndWait = (data, opcode, subopcode) => {
      client.send(data);
      return client.waitNextData(opcode, subopcode, 5000);
    }

    client.getWaitingSignals = () => {
      let w = waitingSignals;
      waitingSignals = [];
      return w;
    }

    client.connect(port, ip, function () {
      client.connected = true;
      if (onConnect) onConnect(client);
      resolve(client);
    });

    let frag: Buffer = Buffer.allocUnsafe(0);
    let fragCount = 0;

    client.on('data', (data: Buffer) => {
      if (frag.length > 0) {
        data = Buffer.concat([frag, data]);
        fragCount++;
      }

      while (data.length > 0) { // multiple data control
        let length = readShort(data, 2);

        if (doesProtocolHeaderValid(data)) return client.terminate('invalid protocol begin')
        if (doesProtocolFooterValid(data, length)) {
          if (fragCount > 10) {
            return client.terminate('too much fragmentation not allowed');
          }
          frag = data;
          return;
        }

        if (frag.length > 0) {
          frag = Buffer.allocUnsafe(0);
          fragCount = 0;
        }

        let onlyBody;
        let opcode = data[4];
        let subopcode = data[5];
        let didSent = false;

        if (opcode == 0x42) { // COMPRESSED_PACKAGE
          const body = Queue.from(data.slice(5, 4 + length));
          let len = body.int();
          let realLen = body.int();
          let crc = body.int();
          let compressedData = body.sub(len);
          let uncompressedData = lzfjs.decompress(new Uint8Array(compressedData));
          let crcUncompressedData = crc32.buf(uncompressedData, ~-1);
          // if (crcUncompressedData != crc || uncompressedData.length != realLen || compressedData.length != len) {
          //   throw new Error('invalid compressed data!');
          // }

          data = Buffer.from([0xAA, 0x55, ...short(realLen), ...Array.from(uncompressedData), 0x55, 0xAA, ...data.slice(6 + length)]);
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
          const body = Queue.from(onlyBody);
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
      console.error('[CLIENT ERROR]', err);
    });

    client.on('close', function () {
      client.connected = false;

      for (let i of waitingTasks) {
        i.reject(new Error('Connection is closed!'));
      }
    });
  });
}

function doesProtocolHeaderValid(data) {
  return data[0] != 0xAA || data[1] != 0x55;
}

function doesProtocolFooterValid(data, length) {
  return data[4 + length] != 0x55 || data[5 + length] != 0xAA
}

export interface IKOClientSocket extends net.Socket {
  connected: boolean
  waitNextData: (opcode?: number, subopcode?: number, timeout?: number) => IWaitingTaskPromise
  terminate: (message?: string) => void
  send: (response: number[]) => void
  sendAndWait: (data: number[], opcode: number, subopcode?: number) => IWaitingTaskPromise
  getWaitingSignals: () => Buffer[]
}

export interface IClientConfiguration {
  ip: string
  port: number
  name: string
  onConnect?: (socket: IKOClientSocket) => void
}

export interface IWaitingTaskPromise extends IDeferredPromise {
  opcode: number
  subopcode: number
}
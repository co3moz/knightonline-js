Knight Online TS Server-side Project
=======================

## Project structure
Project is developed with typescript. You have to compile the code before running. Also all tests have to be written as typescript. Typescript default configurations are;

* always strict
* source map enabled
* no comments
* target: es2017

Project designed to run in node v10.14.x+.

As database we use mongodb. also we use redis to cache. But redis might be removed later.

## Project core

Project is all about to serve knight online client. Knight Online client uses several ports to operate.

* Login server
* Game server

### Login server

Login server is the first endpoint to reach. When user opens launcher, *tcp* connection will be establish between server and client. Server port is *15100* as default. But this port value is changed in later versions to help load balancing. This project will cover all ports that required. New port range is starts with *15100* ends with *15109*. Launcher will pick random port when starts. 

### Game server

Game server is the deal. After user logins, login server advises to connect game server. Game server always works at *15001* port. If client cant reach the server, user will see *10061* or similiar error that tells couldn't reach the server. (10061 is tcp error code)

### Standards

Both login and game server will use tcp for communication. Packets are in same structure so we can easily detech errors. 

#### Packet structure

All messages that send or received has to be in ko communication standard. Standard simply says these rules;

* All messages has to be start with *0xAA* and *0x55* bytes. These bytes represent 10101010 and 01010101. 
* All messages has to be end with *0x55* and *0xAA* bytes. These bytes are reversed of start bytes.
* After the start bytes there will be a short value that says the length of real message.

For example;

If we want to send `HELLO` message, message that we will send will be `"\xAA\x55\x05\x00HELLO\x55\xAA"`

All short, integer, long values have to be little-endian style (most significant binaries go to next byte)

> There is short-string and byte-string. byte-string is for sending character names. it basically have 1 byte of length, then content. short-string is 2 byte of length then content. Client and server always know using the right one, if client expects byte-string then server has to send byte-string. Example; "DOGAN" byte-string: "\x05DOGAN" short-string: "\x05\x00DOGAN". 

#### Operation standard

After wrapping the packet with 0x55AA and 0xAA55, we send a byte to define our operation. All operation codes are reversed engineered. Knight Online Client will send specific operation bytes to say things. 

For example;

* Launcher asks the server's last version: (Operation byte "1" simply LOGIN_REQ signal) `"\xAA\x55\x01\x00\x01\x55\xAA"` 
* Launcher asks ftp information and which files to download. (Operation byte "2" simply DOWNLOADINFO_REQ signal) `"\xAA\x55\x03\x00\x02\x00\x00\x55\xAA"` (after 0x02 client sends \x00\x00 this is actually current version of game. so server will tell which files to download)

This examples will cover the client side, but server side works same. It will wraps with 0xAA55 and sends a operation code. 

#### How this standards effect our code

Always we will send and receive same format over and over again. Thats why we have `src/core` folder in our project. In this folder we define all the common stuff for both login and game server. 

To create a socket server, the definition of factory is defined in `src/core/server.ts` folder. You can create server cluster (you can listen multiple sockets at one time) by calling `KOServerFactory` function.

```ts
await KOServerFactory({
  ip: '127.0.0.1',
  ports: [15100, 15101, 15102], //...
  timeout: 5000 // if socket client waits 5 seconds without sending and valid data, socket will be terminated
})
```

`KOServerFactory` function returns promise. After sockets started to listen it will resolved. 
To receive any data you will create a data in function.


##### Connect and disconnect

When client connects, `onConnect` function will be called. This function is not required for creating servers.

```ts
await KOServerFactory({
  //... ip, ports, timeout ...

  onConnect: (socket: IKOSocket) => {
    console.log("Hey, I connected");
  }
})
```

Each server capable to handle 3000 connections. More connections will be dropped instantly for safety. _This numbers can be change_. There are some security checks also, but don't forget to add more security definitions on *server iptables*.

When client disconnects, `onDisconnect` function will be called.

```ts
await KOServerFactory({
  //... ip, ports, timeout ...

  onDisconnect: async (socket: IKOSocket) => {
    console.log("Hey, I disconnected");
  }
})
```

Biggest difference between two functions are the one of them is async function that returns a promise. `onDisconnect` function can do async stuff, for example saving the information to database.. 


##### Data

`onData` function will be called, if client sends data as in standards (0xAA55 thing and length). Also it can parse multiple requests (for example: `\xAA\x55\x01\x00\x01\x55\xAA\xAA\x55\x01\x00\x01\x55\xAA`)

```ts
await KOServerFactory({
  //... ip, ports, timeout ...

  onData: async (socket: IKOSocket, data: Buffer) => {

  }
})
```

As you can see, `onData` function is async function. You can halt the client while some async tasks running and if another data comes from client, it will wait until the all tasks finished. That way we prevent clients to ask multiple data at once. But it won't block the all queue. This will only blocks per socket. So if A client asks for some task, if B client asks for another task, both of them will receive the answer asynchronously. Queue has the 100 limit, so if client tries to brute force something core functionality will catch it and terminate the socket.

##### Socket

`IKOSocket` is an interface that covers simple things. For example: it stores `connectedAt` value, or `send(packet: number[])` function.

```ts
export interface IKOSocket extends net.Socket {
  session: number
  connectedAt: number
  send: (packet: number[]) => void
  terminate: (message?: string) => IDeferredPromise
  terminatePromise: IDeferredPromise
  cryption?: Crypt
}
```

This ones are so important, so I will cover up all.

* `session`: All connected sockets will have unique session. Unless the client disconnect, this session wont be set to any other socket. Sessions are stored in a pool. When user connects, we ask the pool for new session value. If pool won't give any value then we drop the connection. At the beginning 3000 value will be pushed into pool. Session value is actually short (0-65535) but due many things that we can't cover rightnow we limit it to 1-10000

* `connectedAt`: Maybe this value is useful later. It stores when socket is connected. 

* `send`: Sends packet to client, but it can do many magical things. First thing that it can do is wrap the message between 0xAA55 and 0x55AA. Then it will add length of the message. The magical thing is, knight online client can compress the packet to save some bandwith. If message length is too much, send function will compress the message, then send.

* `terminate`: Terminates the socket. It will return a promise and this promise will be resolved when socket is fully disconnect. The meaning of fully disconnect is saving all user related things.. It will be useful when another client connects to server with same credentials, so we force the old client to logout. (onDisconnect will be waited to resolve)

* `terminatePromise`: Terminate function will return the same promise, but if you need to access it, or check it for termination action, you can retrive it by this.

* `cryption`: Knight online client is capable to crypt messages for safety. This is standard of both login and game server. So if this cryption variable is exists then, Core will decrypt the messages or crypt messages when send.

Login or game server might create own interface like IGameSocket or ILoginSocket by extending IKOSocket. That way we might put more stuff to socket. For example; in game server we login an account. So after the login we might need the information on the runtime, we put the login information to socket object like saying this;

```ts
export interface IGameSocket extends IKOSocket {
  user: IAccount
}
```

When we need it, we simply call;

```ts
let user: IAccount = socket.user;

if (!user) throw new Error('You didn\'t login yet');
```

### Configurations

To handle configurations we will use `node-config`. Its quite neat tool. Also we prefered `.yaml` configuration format for easy editing and more human readable configurations. To read some configuration you might use;

```ts
import * as config from 'config'

let value = <any>config.get('someconfiguration')
```

> `config.get` function won't return any types. so do not forget to assign types to your variables..

```ts
import * as config from 'config'

let value: number[] = <any>config.get('someconfiguration')
```

### Database

We said that we will use mongodb as our main database. For framework we prefer mongoose. All database source are defined in `src/core/database` folder. 

If you need database, you can call `Database()` async function. After connection is establish it will resolve. You can use models to ask data from it. If you need to close connection, simply call `DisconnectFromDatabase()` async function. 

#### Models

All models are defined in `src/core/database/models` folder. Mongoose is not typescript ready library. So we also create interfaces to use models. Lets examine the `src/core/database/models/account.ts` file.

```ts
  // mongoose standard is create schemas and bind schema to a model
  export const AccountSchema = new Schema({
    account: { type: String },
    password: { type: String },
  }, {}); 

  // we created a schema, we also create interface of it.
  export interface IAccount extends Document {
    account: string
    password: string
  }

  // then we bind it to model
  export const Account = model<IAccount>('Account', AccountSchema, 'accounts')
```

#### Defaults

Knight online has default values. For example item definitions won't change. There are 400.000 items.. and we can't simply use json file to read it. After connecting the database defaults will executed. For items `src/core/database/defaults/item.ts` file will executed. This file basically check the database for records. If there is no record then, it will unzip the `data/items.zip` file. This zip file contains `items.csv`. This file is 100mb~ big (after compressed its 3mb~). There is csv reader system and it will read the csv file, and insert the record to the database. Rightnow we also check test accounts, set items, setting definitions (this might be removed later), server definitions (this might be removed later), npcs (also this might be removed).. 

#### Using the database

After connection is establish, import the model from location. then call mongo endpoints.

```ts
  import { Account, IAccount } from 'core/database/models/account'

  let account: IAccount = await Account.findOne({
    account: 'myaccount'
  }).exec();

  if (!account) {
    throw new Error('invalid account');
  }

  console.log(account.password); // IAccount helps the developer for typesafe coding..
```

### Queue API

This is a basic wrapper class for handling buffers. If we want to read some value from buffer as byte or short or integer or long, we use this wrapper class to handle it.

```ts
import { Queue } from 'src/core/utils/unit'

let buffer: Buffer = Buffer.from([1, 2, 0]);
let queue: Queue = Queue.from(buffer);

queue.byte(); // 1
queue.short(); // 2
```

This class is used everywhere in the code. When client ask for information, we can parse it easily with this.

## Login server

Login server is design to tell clients download new patches and welcome to game server. File structure is in `src/login_server` location. Login server has port range of 15100-15109, thats the reason why we set login ports as an array on the configuration file.

```yaml
loginServer:
  ip: 0.0.0.0
  ports: 
    - 15100
    - 15101
    - 15102
    - 15103
    - 15104
    - 15105
    - 15106
    - 15107
    - 15108
    - 15109
```

Setting ip to `0.0.0.0` basically tells to operating system, bind every endpoint that could exist. That way it will bind `127.0.0.1` and local router network `192.168.1.x` or on cloud `51.15.60.17`

We call database to load up before starting server. We might need an information after..

### Life cycle of operations/endpoints

Endpoints are defined in `src/login_server/endpoint.ts`. When request comes from client, first we check the `LoginEndpointCodes` enum defined in this file. User's request will be a byte, so if we look for that value in this enum we will figure out the correct endpoint name. For example, when user send `"\xAA\x55\x01\x00\x01\x55\xAA"`; onData function's data parameter will be `[0x01]`. We wrap it with `Queue` class and get the first byte. It's "0x01". We look it in the `LoginEndpointCodes`. and its `VERSION_REQ`. Then basically we load `src/login_server/endpoints/VERSION_REQ.ts`. 

#### VERSION_REQ

Why request comes: **User opens the launcher**

Launcher sends: 
* Current version of files (short)

Server sends:
* Last version (short)

What happens next: **If version is match, launcher closes (socket close) and game starts**

#### DOWNLOADINFO_REQ

Why request comes: **Launcher received the last version, and current version is not matching last version**

Launcher sends: 
* Current version of files (short)

Server sends:
* FTP Address (short-string)
* FTP Directory (short-string)
* How much file (short)
* For each file;
  - File name (short-string)

What happens next: **Socket closes, Connects the FTP server, starts to download**

## Starting

To start application, you can use `npm start` for simplicity. 

## Debugging

Our accepted IDE is Visual Studio Code. For visual studio code, the configurations for debugging is ready to use. We already push the "Run" task. But if you want to use some other ide for debugging, you can use this;

```sh
TS_NODE_TRANSPILE_ONLY=true node -r ts-node/register --expose-gc --no-lazy src/app.ts
```

> Will be continued..
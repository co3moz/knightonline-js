import { IGameSocket } from "./game_socket";
import { INPCInstance } from "./ai_system/declare";
import { OnUserExit } from "./events/onUserExit";
import { OnRegionUpdate } from "./events/onRegionUpdate";

export const RRegionMap: IRegionDictionary = {};
export const RUserMap: IUserDictionary = {};
export const RZoneMap: IZoneDictionary = {};
export const RSessionMap: ISessionDictionary = {};
export const RNPCRegionMap: INPCRegionDictionary = {};
export const RNPCMap: INPCDictionary = {};

export function GetRegionName(socket: IGameSocket) {
  let c = socket.character;
  if (!c) return '';

  let q = RUserMap[c.name];
  if (q) {
    return q.s;
  }

  return '';
}

export function RegionUpdate(socket: IGameSocket, disableEvent = false): boolean {
  let c = socket.character;
  if (!c) return false;
  let x = c.x / 35 >> 0;
  let z = c.z / 35 >> 0;
  let s = `${c.zone}x${x}z${z}`;

  if (RUserMap[c.name]) {
    if (RUserMap[c.name].s == s) return false;

    RegionRemove(socket);
  }

  if (!RRegionMap[s]) {
    RRegionMap[s] = [];
  }

  if (!RZoneMap[c.zone]) {
    RZoneMap[c.zone] = [];
  }

  RRegionMap[s].push(socket);
  RZoneMap[c.zone].push(socket);
  RUserMap[c.name] = <IRegionUser>{ s, zone: c.zone, x, z, socket };
  RSessionMap[socket.session] = socket;

  if (!disableEvent) {
    OnRegionUpdate(socket);
  }
  return true;
}


export function RegionUpdateNPC(npc: INPCInstance) {
  let x = npc.x / 35 >> 0;
  let z = npc.z / 35 >> 0;
  let s = `${npc.zone}x${x}z${z}`;

  if (RNPCMap[npc.uuid]) {
    if (RNPCMap[npc.uuid].s == s) return false; // no need to update

    RegionRemoveNPC(npc);
  }

  if (!RNPCRegionMap[s]) {
    RNPCRegionMap[s] = [];
  }

  RNPCRegionMap[s].push(npc);
  RNPCMap[npc.uuid] = <IRegionNPC>{ s, zone: npc.zone, x, z, npc };
  return true;
}

export function RegionRemove(socket: IGameSocket) {
  delete RSessionMap[socket.session];
  let c = socket.character;
  if (!c) return;

  let us = RUserMap[c.name];

  if (us) {
    delete RUserMap[c.name];

    let userRegion = RRegionMap[us.s];
    let userRegionIndex = userRegion.findIndex(x => x == socket);
    userRegion.splice(userRegionIndex, 1);

    if (userRegion.length == 0) {
      delete RRegionMap[us.s];
    }

    let userZone = RZoneMap[us.zone];
    let userZoneIndex = userZone.findIndex(x => x == socket);
    userZone.splice(userZoneIndex, 1);
  }
}

export function RegionRemoveNPC(npc) {
  let n = RNPCMap[npc.uuid];

  if (n) {
    delete RNPCMap[npc.uuid];

    let region = RNPCRegionMap[n.s];
    let index = region.findIndex(x => x == npc);
    region.splice(index, 1);

    if (region.length == 0) {
      delete RNPCRegionMap[n.s];
    }
  }
}

export function RegionExit(socket) {
  OnUserExit(socket);
  RegionRemove(socket);
}

export function* RegionQuery(socket, opts?: IQueryOptions) {
  let c = socket.character;
  let s = RUserMap[c.name];
  if (!s) return;

  if (opts && opts.all) { // query users without caring location?
    for (let key in RUserMap) {
      yield RUserMap[key].socket;
    }
    return;
  }

  if (opts && opts.zone) { // query users by zone only?
    yield* RZoneMap[s.zone];
    return;
  }

  let fix = `${s.zone}x`

  let cx = s.x;
  let cz = s.z;
  let d = (opts ? opts.d : null) || 1;

  for (let x = -d; x <= d; x++) {
    for (let y = -d; y <= d; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (RRegionMap[s]) {
        yield* RRegionMap[s];
      }
    }
  }
}

export function* RegionQueryNPC(socket, d = 1) {
  let c = socket.character;
  let s = RUserMap[c.name];
  if (!s) return;

  let fix = `${s.zone}x`

  let cx = s.x;
  let cz = s.z;

  for (let x = -d; x <= d; x++) {
    for (let y = -d; y <= d; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (RNPCRegionMap[s]) {
        yield* RNPCRegionMap[s];
      }
    }
  }
}

export function* RegionQueryUsersByNpc(regionNPC) {
  let fix = `${regionNPC.zone}x`

  let cx = regionNPC.x / 35 >> 0;
  let cz = regionNPC.z / 35 >> 0;

  let d = 1;

  for (let x = -d; x <= d; x++) {
    for (let y = -d; y <= d; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (RRegionMap[s]) {
        yield* RRegionMap[s];
      }
    }
  }
}

export function RegionSend(socket: IGameSocket, packet: number[]): void {
  for (let s of RegionQuery(socket)) {
    s.send(packet);
  }
}

export function RegionSendByNpc(npc: INPCInstance, packet: number[]): void {
  for (let s of RegionQueryUsersByNpc(npc)) {
    s.send(packet);
  }
}

export function ZoneSend(socket: IGameSocket, packet: number[]): void {
  for (let s of RegionQuery(socket, { zone: true })) {
    s.send(packet);
  }
}

export function AllSend(socket: IGameSocket, packet: number[]): void {
  for (let s of RegionQuery(socket, { all: true })) {
    s.send(packet);
  }
}

export interface IRegionCharacter {

}

export interface ISessionDictionary {
  [session: number]: IGameSocket
}


export interface IUserDictionary {
  [user: string]: IRegionUser
}

export interface INPCDictionary {
  [npcUUID: number]: IRegionNPC
}

export interface IZoneDictionary {
  [zone: number]: IGameSocket[]
}

export interface IRegionDictionary {
  [regionId: string]: IGameSocket[]
}

export interface INPCRegionDictionary {
  [regionId: string]: INPCInstance[]
}

export interface IRegionUser {
  /** Region id */
  s: string

  /** Zone id */
  zone: number

  /** Region x */
  x: number

  /** Region z */
  z: number

  /** Game socket */
  socket: IGameSocket
}

export interface IRegionNPC {
  /** Region id */
  s: string

  /** Zone id */
  zone: number

  /** Region x */
  x: number

  /** Region z */
  z: number

  /** NPC instance */
  npc: INPCInstance
}

interface IQueryOptions {
  zone?: boolean
  all?: boolean
  d?: number
}
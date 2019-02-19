import { IGameSocket } from "./game_socket";
import { INPCInstance } from "./ai_system/declare";

export const regions: IRegionDictionary = {};
export const users: IUserDictionary = {};
export const zones: IZoneDictionary = {};
export const sessions: ISessionDictionary = {};
export const npcRegions: INPCRegionDictionary = {};
export const npcs: INPCDictionary = {};

let onChange = null;
let onExit = null;

export function GetRegionName(socket: IGameSocket) {
  let c = socket.character;
  if (!c) return '';

  let q = users[c.name];
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

  if (users[c.name]) {
    if (users[c.name].s == s) return false;

    RegionRemove(socket);
  }

  if (!regions[s]) {
    regions[s] = [];
  }

  if (!zones[c.zone]) {
    zones[c.zone] = [];
  }

  regions[s].push(socket);
  zones[c.zone].push(socket);
  users[c.name] = { s, zone: c.zone, x, z, socket };
  sessions[socket.session] = socket;

  if (!disableEvent && onChange) {
    onChange(this, socket, s);
  }
  return true;
}


export function RegionUpdateNPC(npc: INPCInstance) {
  let x = npc.x / 35 >> 0;
  let z = npc.z / 35 >> 0;
  let s = `${npc.zone}x${x}z${z}`;

  if (npcs[npc.uuid]) {
    if (npcs[npc.uuid].s == s) return false; // no need to update

    RegionRemoveNPC(npc);
  }

  if (!npcRegions[s]) {
    npcRegions[s] = [];
  }

  npcRegions[s].push(npc);
  npcs[npc.uuid] = <IRegionNPC>{ s, zone: npc.zone, x, z, npc };
  return true;
}

export function RegionRemove(socket: IGameSocket) {
  delete sessions[socket.session];
  let c = socket.character;
  if (!c) return;

  let us = users[c.name];

  if (us) {
    delete users[c.name];

    let userRegion = regions[us.s];
    let userRegionIndex = userRegion.findIndex(x => x == socket);
    userRegion.splice(userRegionIndex, 1);

    if (userRegion.length == 0) {
      delete regions[us.s];
    }

    let userZone = zones[us.zone];
    let userZoneIndex = userZone.findIndex(x => x == socket);
    userZone.splice(userZoneIndex, 1);
  }
}

export function RegionRemoveNPC(npc) {
  let n = npcs[npc.uuid];

  if (n) {
    delete npcs[npc.uuid];

    let region = npcRegions[n.s];
    let index = region.findIndex(x => x == npc);
    region.splice(index, 1);

    if (region.length == 0) {
      delete npcRegions[n.s];
    }
  }
}

export function RegionExit(socket) {
  if (onExit) {
    onExit(this, socket);
  }

  RegionRemove(socket);
}

export function* RegionQuery(socket, opts?: IQueryOptions) {
  let c = socket.character;
  let s = users[c.name];
  if (!s) return;

  if (opts && opts.all) { // query users without caring location?
    for (let key in users) {
      yield users[key].socket;
    }
    return;
  }

  if (opts && opts.zone) { // query users by zone only?
    yield* zones[s.zone];
    return;
  }

  let fix = `${s.zone}x`

  let cx = s.x;
  let cz = s.z;
  let d = (opts ? opts.d : null) || 1;

  for (let x = -d; x <= d; x++) {
    for (let y = -d; y <= d; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (regions[s]) {
        yield* regions[s];
      }
    }
  }
}

export function* RegionQueryNPC(socket, d = 1) {
  let c = socket.character;
  let s = users[c.name];
  if (!s) return;

  let fix = `${s.zone}x`

  let cx = s.x;
  let cz = s.z;

  for (let x = -d; x <= d; x++) {
    for (let y = -d; y <= d; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (npcRegions[s]) {
        yield* npcRegions[s];
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
      if (regions[s]) {
        yield* regions[s];
      }
    }
  }
}

export function RegionSend(socket, packet) {
  for (let s of RegionQuery(socket)) {
    s.send(packet);
  }
}

export function RegionSendByNpc(npc, packet) {
  for (let s of RegionQueryUsersByNpc(npc)) {
    s.send(packet);
  }
}

export function ZoneSend(socket, packet) {
  for (let s of RegionQuery(socket, { zone: true })) {
    s.send(packet);
  }
}

export function AllSend(socket, packet) {
  for (let s of RegionQuery(socket, { all: true })) {
    s.send(packet);
  }
}

export function UpdateOnChange(callback) {
  onChange = callback;
}

export function UpdateOnExit(callback) {
  onExit = callback;
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
  npc
}

interface IQueryOptions {
  zone?: boolean
  all?: boolean
  d?: number
}
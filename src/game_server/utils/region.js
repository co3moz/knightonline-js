module.exports = function (onchange, onexit) {
  let regions = {};
  let users = {};
  let zones = {};
  let sessions = {};
  let npcRegions = {};
  let npcs = {};

  return {
    setOnChange(fn) {
      onchange = fn;
    },
    setOnExit(fn) {
      onexit = fn;
    },
    getRegionName(socket) {
      let c = socket.character;
      if (!c) return '';

      let q = users[c.name];
      if (q) {
        return q.s;
      }

      return '';
    },

    update(socket, disableEvent) {
      let c = socket.character;
      if (!c) return false;
      let x = c.x / 35 >> 0;
      let z = c.z / 35 >> 0;
      let s = `${c.zone}x${x}z${z}`;

      if (users[c.name]) {
        if (users[c.name].s == s) return false;

        this.remove(socket);
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
      if (!disableEvent && onchange) {
        onchange(this, socket, s);
      }
      return true;
    },

    updateNpc(npc) {
      let x = npc.x / 35 >> 0;
      let z = npc.z / 35 >> 0;
      let s = `${npc.zone}x${x}z${z}`;

      if (npcs[npc.uuid]) {
        if (npcs[npc.uuid].s == s) return false; // no need to update

        this.removeNpc(npc);
      }

      if (!npcRegions[s]) {
        npcRegions[s] = [];
      }

      npcRegions[s].push(npc);
      npcs[npc.uuid] = { s, zone: npc.zone, x, z, npc };
      return true;
    },

    remove(socket) {
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
    },

    removeNpc(npc) {
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
    },

    exit(socket) {
      if (onexit) {
        onexit(this, socket);
      }

      this.remove(socket);
    },

    *query(socket, opts = { zone: false, npcs: false, all: false, d: 1 }) {
      let c = socket.character;
      if (!c) return;

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

      if (opts && opts.npcs) { // query for npcs?
        for (let x = -d; x <= d; x++) {
          for (let y = -d; y <= d; y++) {
            let s = `${fix}${cx + x}z${cz + y}`;
            if (npcRegions[s]) {
              yield* npcRegions[s];
            }
          }
        }
        return;
      }

      for (let x = -d; x <= d; x++) {
        for (let y = -d; y <= d; y++) {
          let s = `${fix}${cx + x}z${cz + y}`;
          if (regions[s]) {
            yield* regions[s];
          }
        }
      }
    },

    *queryNpcs(socket) {
      yield* this.query(socket, { npcs: true });
    },


    *queryUsersByNpc(regionNPC) {
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
    },

    regionSend(socket, packet) {
      for (let s of this.query(socket)) {
        s.send(packet);
      }
    },

    zoneSend(socket, packet) {
      for (let s of this.query(socket, { zone: true })) {
        s.send(packet);
      }
    },

    allSend(socket, packet) {
      for (let s of this.query(socket, { all: true })) {
        s.send(packet);
      }
    },

    regions,
    users,
    sessions,
    npcs,
    npcRegions
  }
}
module.exports = function () {
  let regions = {};
  let users = {};
  let zones = {};

  return {
    update(socket) {
      if (!socket) return false;
      let c = socket.character;
      if (!c) return false;
      let x = c.x / 10 >> 0;
      let z = c.z / 10 >> 0;
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

      console.log('REGION CHANGE ' + c.name + ' ' + s);
      regions[s].push(socket);
      zones[c.zone].push(socket);
      users[c.name] = { s, zone: c.zone, x, z, socket };
      return true;
    },

    remove(socket) {
      if (!socket) return;
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

    *query(socket, opts = { zone: false, all: false, d: 1 }) {
      if (!socket) return;
      let c = socket.character;
      if (!c) return;

      let s = users[c.name];
      if (!s) return;

      if (opts && opts.all) {
        for (let key in users) {
          yield users[key].socket;
        }
        return;
      }

      if (opts && opts.zone) {
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
    },

    regionSend(socket, message) {
      for (let s of this.query(socket)) {
        s.send(message);
      }
    },

    zoneSend(socket, message) {
      for (let s of this.query(socket, { zone: true })) {
        s.send(message);
      }
    },

    regions,
    users
  }
}
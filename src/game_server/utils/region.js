module.exports = function (onchange) {
  let regions = {};
  let users = {};
  let zones = {};
  let sessions = {};

  return {
    getRegionName(socket) {
      let c = socket.character;
      if (!c) return '';

      let q = users[c.name];
      if (q) {
        return q.s;
      }

      return '';
    },

    update(socket) {
      let c = socket.character;
      if (!c) return false;
      let x = c.x / 20 >> 0;
      let z = c.z / 20 >> 0;
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
      if (onchange) {
        onchange(this, socket, s);
      }
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

    *query(socket, opts = { zone: false, all: false, d: 1 }) {
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
    sessions
  }
}
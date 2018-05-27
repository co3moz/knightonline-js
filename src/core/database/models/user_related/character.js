const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, index: true },
  race: { type: Number },
  klass: { type: Number },
  hair: { type: Number },
  rank: { type: Number, default: 0 },
  title: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  rebirth: { type: Number, default: 0 },
  exp: { type: Number, default: 1 },
  loyalty: { type: Number, default: 101 },
  loyaltyMonthly: { type: Number, default: 0 },
  face: { type: Number },
  city: { type: Number, default: 0 },
  knights: { type: Number, default: 0 },
  fame: { type: Number, default: 0 },

  hp: { type: Number, default: 100 },
  mp: { type: Number, default: 100 },
  sp: { type: Number, default: 100 },

  statStr: { type: Number },
  statHp: { type: Number },
  statDex: { type: Number },
  statMp: { type: Number },
  statInt: { type: Number },
  statRemaining: { type: Number, default: 0 },

  money: { type: Number, default: 0 },

  zone: { type: Number, default: 21 },
  x: { type: Number, default: 81700 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 43500 },

  skills: { type: Buffer },
  items: { type: Buffer },
  quests: { type: Buffer },
  questCount: { type: Number, default: 0  }
}, {
    timestamps: true
  });

module.exports = db => db.model('Character', schema, 'characters');
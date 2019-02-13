const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, index: true },
  race: { type: Number },
  klass: { type: Number },
  strKlass: { type: String },
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
  gm: { type: Boolean, default: false }, // char based gm

  clan: { type: Number, default: 0 },
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

  x: { type: Number, default: 817 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 435 },
  direction: { type: Number, default: 0 },

  skills: { type: Buffer },
  skillPointCat1: { type: Number, default: 0 },
  skillPointCat2: { type: Number, default: 0 },
  skillPointCat3: { type: Number, default: 0 },
  skillPointMaster: { type: Number, default: 0 },
  skillPointFree: { type: Number, default: 0 },

  items: [{
    id: { type: Number },
    durability: { type: Number },
    amount: { type: Number },
    serial: { type: String },
    expire: { type: Number },
    flag: { type: Number },
    detail: mongoose.SchemaTypes.Mixed
  }],
  quests: [{
    id: { type: Number },
    state: { type: Number }
  }],

  magic: [{
    id: { type: Number },
    expiry: { type: Date }
  }],

  friends: [String],
  skillBar: [Number]
}, {
    timestamps: true
  });

module.exports = db => db.model('Character', schema, 'characters');
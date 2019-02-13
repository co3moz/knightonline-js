const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: { type: Number, index: true },
  name: { type: String },
  pid: { type: Number }, // pictureId
  size: { type: Number },
  weapon1: { type: Number },
  weapon2: { type: Number },
  group: { type: Number },
  actType: { type: Number },
  type: { type: Number },
  family: { type: Number },
  rank: { type: Number },
  title: { type: Number },
  sellingGroup: { type: Number },
  level: { type: Number },
  exp: { type: Number },
  loyalty: { type: Number },
  hp: { type: Number },
  mp: { type: Number },
  attack: { type: Number },
  ac: { type: Number },
  hitRate: { type: Number },
  evadeRate: { type: Number },
  damage: { type: Number },
  attackDelay: { type: Number },
  speed1: { type: Number },
  speed2: { type: Number },
  standtime: { type: Number },
  magic1: { type: Number },
  magic2: { type: Number },
  magic3: { type: Number },
  fireR: { type: Number },
  coldR: { type: Number },
  lightningR: { type: Number },
  magicR: { type: Number },
  diseaseR: { type: Number },
  poisonR: { type: Number },
  bulk: { type: Number },
  attackRange: { type: Number },
  searchRange: { type: Number },
  tracingRange: { type: Number },
  money: { type: Number },
  directAttack: { type: Number },
  magicAttack: { type: Number },
  speed: { type: Number },
  moneyType: { type: Number },

  isMonster: { type: Boolean },
  spawn: [{ type: mongoose.SchemaTypes.Mixed }],
  drops: [{ item: mongoose.SchemaTypes.Mixed, rate: Number }]
}, {
    timestamps: false
  });

module.exports = db => db.model('Npc', schema, 'npcs');
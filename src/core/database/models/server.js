const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  ip: { type: String },
  lanip: { type: String },
  name: { type: String },
  karusKing: { type: String },
  karusNotice: { type: String },
  elmoradKing: { type: String },
  elmoradNotice: { type: String },

  onlineCount: { type: Number, default: 0 },
  userFreeLimit: { type: Number, default: 3000 },
  userPremiumLimit: { type: Number, default: 3000 }
}, {
    timestamps: false
  });

module.exports = db => db.model('Server', schema, 'server');
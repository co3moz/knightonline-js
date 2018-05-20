const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  key: { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
  type: { type: String }
}, {
    timestamps: true
  });

module.exports = db => db.model('Setting', schema, 'settings');
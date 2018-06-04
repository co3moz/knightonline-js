const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  character: { type: String, index: true },
  marker: { type: Number },
  sender: { type: String },
  subject: { type: String },
  message: { type: String },
  type: { type: Number },
  item: { type: Number },
  count: { type: Number },
  durability: { type: Number },
  serial: { type: String },
  money: { type: String },
  deleted: { type: Boolean }
}, {
    timestamps: true
  });

module.exports = db => db.model('Mail', schema, 'mails');
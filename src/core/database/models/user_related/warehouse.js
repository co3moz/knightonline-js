const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  money: { type: Number, default: 0 },
  items: [{
    id: { type: Number },
    durability: { type: Number },
    amount: { type: Number },
    serial: { type: String },
    expire: { type: Number },
    flag: { type: Number },
    detail: mongoose.SchemaTypes.Mixed
  }],
  /*bankStorage: { type: Buffer },
  seal: { type: Buffer }*/
}, {
    timestamps: true
  });

module.exports = db => db.model('Warehouse', schema, 'warehouses');
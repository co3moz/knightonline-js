const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  money: { type: Number, default: 0 },
  /*bankStorage: { type: Buffer },
  seal: { type: Buffer }*/
}, {
    timestamps: true
  });

module.exports = db => db.model('Warehouse', schema, 'warehouses');
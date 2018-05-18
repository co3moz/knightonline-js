const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
    min: 0,
    max: 10000
  },

  fileName: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, {
    timestamps: false
  });



module.exports = function (db) {
  return db.model('Version', schema, 'version');
}


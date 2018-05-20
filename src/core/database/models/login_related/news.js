const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, maxlength: 30 },
  message: { type: String, maxlength: 200 }
}, {
    timestamps: false
  });



module.exports = db => db.model('News', schema, 'news');


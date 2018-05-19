const mongoose = require('mongoose');
const hash = require('../../utils/password_hash');

const schema = new mongoose.Schema({
  account: {
    type: String,
    maxlength: 30
  },

  password: {
    type: String,
    maxlength: 100
  },

  banned: {
    type: Boolean,
    default: false
  },

  bannedMessage: {
    type: String,
    maxlength: 50
  }
}, {
    timestamps: true
  });


schema.pre('save', async function (next) {
  let user = this;

  if (user.isModified('password')) {
    user.password = hash(user.password);
  }

  next();
});


module.exports = db => db.model('Account', schema, 'accounts');
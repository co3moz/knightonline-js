const mongoose = require('mongoose');
const hash = require('../../../utils/password_hash');

const schema = new mongoose.Schema({
  account: { type: String, maxlength: 30 },
  password: { type: String, maxlength: 100 },
  session: { type: String },

  banned: { type: Boolean, default: false },
  bannedMessage: { type: String, maxlength: 50 },

  premium: { type: Boolean },
  premiumEndsAt: { type: Date },

  otp: { type: Boolean, default: false },
  otpSecret: { type: String },
  otpLastFail: { type: Date },
  otpTryCount: { type: Number, default: 0 },


  nation: { type: Number },
  characters: [{ type: String }],

  warehouse: { type: String }
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
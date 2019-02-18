import { PasswordHash } from '../../utils/password_hash';
import { Schema, model, Document } from 'mongoose';

export interface IAccount extends Document {
  account: string
  password: string
  session: string
  banned: boolean
  bannedMessage: string
  premium: boolean
  premiumEndsAt: Date
  otp: boolean
  otpSecret: string
  otpLastFail: Date
  otpTryCount: number
  nation: number
  characters: string[]
  warehouse: string
}

export const AccountSchema = new Schema({
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
}, { timestamps: true });


AccountSchema.pre('save', function (next) {
  let user = <IAccount>this;

  if (user.isModified('password')) {
    user.password = PasswordHash(user.password);
  }

  next();
});

export const Account = model<IAccount>('Account', AccountSchema, 'accounts')
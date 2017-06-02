const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config/secret');

const UserSchema = new mongoose.Schema({
  id: Number,
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Parameter 'email' should be specified"],
    match: [/\S+@\S+\.\S+/, 'Email is invalid']
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  hash: { type: String, default: '' },
  salt: { type: String, default: '' }
}, {
  timestamps: true
});

UserSchema.methods.setPassword = function (pass) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(pass, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.verifyPassword = function (pass) {
  let hash = crypto.pbkdf2Sync(pass, this.salt, 10000, 512, 'sha512').toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
  let today = new Date();
  let exp = new Date();
  exp.setDate(today.getDate() + 5);

  return jwt.sign({
    id: this._id,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.getAuthJSON = function () {
  return {
    id: this.id,
    email: this.email,
    token: this.generateJWT()
  };
};

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.hash;
    delete ret.salt;
    delete ret._id;
    delete ret.__v;

    return ret;
  }
});

UserSchema.plugin(autoIncrement.plugin, {model: 'User', startAt: 1, field: 'id'});

module.exports = mongoose.model('User', UserSchema);
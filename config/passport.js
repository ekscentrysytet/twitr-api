const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  User.findOne({email: email})
    .then((user) => {
      if (!user) return done(null, false, {errors: {email: 'User with this email doesn\'t exists'}});
      if (!user.verifyPassword(password)) return done(null, false, {errors: {password: 'Password is invalid'}});

      return done(null, user);
    })
    .catch(done);
}));
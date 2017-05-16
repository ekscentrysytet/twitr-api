const jwt = require('express-jwt');
const secret = require('./secret');

function getToken (req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

const auth = jwt({
  secret: secret,
  getToken: getToken
});

module.exports = auth;
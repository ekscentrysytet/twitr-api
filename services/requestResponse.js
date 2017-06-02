const appConstants = require('../constants/app.constants');
const _lang = require('lodash/lang');
const _object = require('lodash/object');

exports.error = (fieldName, fieldVal) => {
  let response = {
    errors: {}
  };

  if (typeof fieldVal === 'object') {
    response = fieldVal;
  } else {
    if (_object.has(appConstants.errorMessages, fieldName)) {
      const errMsg = typeof appConstants.errorMessages[fieldName] === 'function'
        ? appConstants.errorMessages[fieldName](fieldVal)
        : appConstants.errorMessages[fieldName];

      response.errors[fieldName] = errMsg;
    } else {
      response.errors.err = fieldName;
    }
  }

  return response;
};

exports.success = (fieldName, fieldVal) => {
  let response = {
    data: null
  };

  if (!fieldName && fieldVal)
    response.data = fieldVal;

  if (fieldName) {
    if (_lang.isArray(fieldName)) {
      response.data = fieldName.reduce((obj, field, i) => {
        obj[field] = fieldVal[i];
        return obj;
      }, {})
    } else {
      response.data = {
        [fieldName]: fieldVal
      }
    }
  }

  return response;
};
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const auth = require('../config/auth');
const multer = require('multer');
const url = require('url');
const co = require('co');
const requestResponse = require('../services/requestResponse');

const storageFolder = 'media/users/images';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `./${storageFolder}`);
  },
  filename(req, file, cb) {
    let fileArr = file.originalname.split('.');
    let fileExt = fileArr[fileArr.length - 1].toLowerCase();

    cb(null, `${file.fieldname + Date.now()}.${fileExt}`);
  }
});

const avatarUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // max filesize 2MB
    fileSize: 2000000 
  }
});

function fileFilter (req, file, cb) {
  let acceptedFileExt = ['jpg', 'jpeg', 'png'];

  let fileArr = file.originalname.split('.');
  let fileExt = fileArr[fileArr.length - 1].toLowerCase();

  if (acceptedFileExt.indexOf(fileExt) === -1) {
    cb(null, false);
    req.fileValidationError = new Error('invalid file format');
  } else {
    cb(null, true);
  }
}

let usersRouter = express.Router();

usersRouter
  .get('/user', auth, (req, res, next) => {
    User.findById(req.user.id)
      .then(user => res.json(requestResponse.success(null, user)))
      .catch(next);
  })

  .post('/users', (req, res, next) => {
    const user = new User(req.body);

    if (!req.body.password)
      return res.status(422).json(requestResponse.error('requiredParam', 'password'));

    user.setPassword(req.body.password);

    user.save()
      .then(user => res.status(201).json(requestResponse.success(['user', 'token'], [user, user.generateJWT()])))
      .catch(next);
  })

  .post('/users/login', (req, res, next) => {
    passport.authenticate('local', {session: false, failureFlash: 'Invalid username or password.'}, function (err, user, info) {
      if (err)
        return next(err);

      if (!user)
        return res.status(422).json(requestResponse.error('auth', info));

      return res.json(requestResponse.success(['user', 'token'], [user, user.generateJWT()]));
      
    })(req, res, next);
  })

  .post('/user/password', auth, (req, res, next) => {
    co(function* () {
      const user = yield User.findById(req.user.id);

      if (!user)
        throw new Error('userId');

      user.setPassword(req.body.password);

      const savedUser = yield user.save();

      return savedUser;
    })
      .then(user => res.json(requestResponse.success('user', user)))
      .catch(err => res.status(404).json(requestResponse.error(err.message, req.user.id)));
  })

  .post('/user/image', auth, avatarUpload.single('image'), (req, res, next) => {
    User.findById(req.user.id)
      .then(user => {
        if (!user)
          res.status(404).json(requestResponse.error('userId', req.user.id));

        if (req.fileValidationError)
          return res.status(422).json(requestResponse.error('invalidFile'));

        user.image = `${req.protocol}://${req.get('host')}/${storageFolder}/${req.file.filename}`;

        return user.save()
          .then(() => {
            return res.json(requestResponse.success(null, {
              image: user.image
            }));
          })
          .catch(next);
      })
      .catch(next)
  })

  .put('/user', auth, (req, res, next) => {
    User.findByIdAndUpdate(req.user.id, req.body, {new: true})
      .then(user => {
        if (!user)
          res.status(404).json(requestResponse.error('userId', req.user.id));

        res.json(requestResponse.success('user', user))
      })
      .catch(next);
  });

module.exports = usersRouter;
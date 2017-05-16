const router = require('express').Router();

const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const usersRouter = require('./users');

router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/', usersRouter);

router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
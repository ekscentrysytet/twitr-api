const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../config/auth');
const requestResponse = require('../services/requestResponse');
const co = require('co');

const commentsRouter = express.Router();

commentsRouter
  .get('/', auth, (req, res, next) => {
    if (!req.query.postId)
      return res.status(400).json(requestResponse.error('requiredQueryParam', 'postId'));

    return Posts.findOne({id: req.query.postId}, {_id: 0})
      .populate('comments')
      .then(post => {
        if (!post)
          return res.status(422).json(requestResponse.error('postId', req.query.postId));

        return res.json(requestResponse.success('comments', post.comments));
      })
      .catch(next);
  })

  .post('/', auth, (req, res, next) => {
    if (!req.query.postId)
      return res.status(400).json(requestResponse.error('requiredQueryParam', 'postId'));

    let comment = new Comment(req.body);

    co(function* () {
      const user = yield User.findById(req.user.id);

      if (!user)
        throw new Error('userId');

      const post = yield Post.findOne({id: req.query.postId});

      if (!post)
        throw new Error('postId');

      comment.author = user;

      const savedComment = yield comment.save();

      post.comments.push(comment);

      const savedPost = yield post.save();

      return savedComment;
    })
      .then(comment => res.status(201).json(requestResponse.success(null, comment)))
      .catch(err => {
        let errorVal;

        if (err.message === 'userId')
          errorVal = req.user.id;

        if (err.message === 'postId')
          errorVal = req.query.postId;

        res.status(422).json(requestResponse.error(err.message, errorVal));
      });
  })

  .put('/:commentId', auth, (req, res, next) => {
    co(function* () {
      const comment = yield Comment.findOne({id: req.params.commentId});

      if (!comment)
        throw new Error('commentId');

      const updatedComment = yield comment.update(req.body);

      return updatedComment;
    })
      .then(comment => res.json(requestResponse.success(comment)))
      .catch(err => requestResponse.error(err.message, req.params.commentId));
  })

  .delete('/:commentId', auth, (req, res, next) => {
    co(function* () {
      const comment = Comment.findOne({id: req.params.commentId});

      if (!comment)
        throw new Error('commentId');

      yield comment.remove();

      return comment;
    })
      .then(() => res.json(requestResponse.success()))
      .catch(err => res.json(requestResponse.error(err.message, req.params.commentId)));
  });

module.exports = commentsRouter;
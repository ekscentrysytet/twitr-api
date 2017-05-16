const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../config/auth');
const co = require('co');
const requestResponse = require('../services/requestResponse');

const postsRouter = express.Router();

postsRouter
  .get('/', auth, (req, res, next) => {
    let searchQuery = {};
    let page =  parseInt(req.query.page) || 1;
    let postsPerPage = parseInt(req.query.perPage) || 10;

    co(function* () {
      if (req.query.userId) {
        const author = yield User.findOne({id: req.query.userId});

        if (author) {
          searchQuery.author = author._id;
        } else {
          throw new Error('userId');
        }
      }

      const postsCount = Post.count(searchQuery).exec();

      const posts = Post.find(searchQuery)
        .limit(postsPerPage)
        .skip((page - 1) * postsPerPage)
        .sort({createdAt: 'desc'})
        .populate('author')
        .populate('comments');

      const result = yield [posts, postsCount];

      return result;
    })
      .then(result => {
        const posts = result[0];
        const postsCount = result[1];
        const pages = Math.ceil(postsCount / postsPerPage);
        return res.json(requestResponse.success(null, {
          posts,
          page,
          postsCount,
          pages
        }));
      })
      .catch(err => res.status(404).json(requestResponse.error(err.message, req.query.userId)));
  })

  .get('/:postId', auth, (req, res, next) => {
    return Post.findOne({id: req.params.postId}, {_id: 0})
      .populate('comments')
      .then(post => {
        if (!post)
          return res.status(404).json(requestResponse.error('postId', req.params.postId));

        return res.json(requestResponse.success('post', post));
      })
      .catch(next);
  })

  .get('/:postId/comments', auth, (req, res, next) => {
    return Post.findOne({id: req.params.postId}, {_id: 0})
      .populate('comments')
      .then((post) => {
        if (!post)
          return res.status(422).json(requestResponse.error('postId', req.params.postId));

        return res.json(requestResponse.success('comments', post.comments));
      })
      .catch(next);
  })

  .post('/', auth, (req, res, next) => {
    co(function* () {
      const user = yield User.findById(req.user.id);

      if (!user)
        throw new Error('userId');

      let post = new Post(req.body);
      post.author = user;

      const newPost = yield post.save();
      return newPost;
    })
      .then(newPost => res.status(201).json(requestResponse.success('post', newPost)))
      .catch(err => res.status(404).json(requestResponse.error(err.message, req.user.id)));
  })

  .put('/:postId', auth, (req, res, next) => {
    co(function* () {
      const post = yield Post.findOne({id: req.params.postId});

      if (!post)
        throw new Error('postId');

      if (req.user.id !== post.author.toString())
        throw new Error('noRights');

      const updatedPost = yield post.update(req.body);
      return updatedPost;
    })
      .then(result => res.json(requestResponse.success('post', result)))
      .catch(err => {
        let errCode;
        if (err.message === 'postId')
          errCode = 404;

        if (err.message === 'noRights')
          errCode = 403;

        res.status(errCode).json(requestResponse.error(err.message, req.params.postId));
      })
  })

  .delete('/:postId', auth, (req, res, next) => {
    co(function* () {
      const post = Post.findOne({id: req.params.postId});

      if (!post)
        throw new Error('postId');
      console.log(post.author);
      if (req.user.id !== post.author.toString())
        throw new Error('noRights');

      const removedPost = post.remove();

      return removedPost;
    })
      .then(removedPost => res.json(requestResponse.success('post')))
      .catch(err => res.status(422).json(requestResponse.error(err.message, req.params.postId)));
  });

module.exports = postsRouter;
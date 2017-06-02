const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const commentSchema = new mongoose.Schema({
  id: Number,
  text: {
    type: String,
    required: true
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// remove unnecessary fields from response object
commentSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id;
    delete ret.__v;

    return ret;
  }
});

commentSchema.plugin(autoIncrement.plugin, {model: 'Comment', startAt: 1, field: 'id'});

module.exports = mongoose.model('Comment', commentSchema);
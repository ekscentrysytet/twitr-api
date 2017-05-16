const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const postSchema = new mongoose.Schema({
  id: Number,
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
  timestamps: true
});

// remove unnecessary fields from document on response
postSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id;
    delete ret.__v;

    return ret;
  }
});

postSchema.plugin(autoIncrement.plugin, {model: 'Post', startAt: 1, field: 'id'});

module.exports = mongoose.model('Post', postSchema);
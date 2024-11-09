const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Post = require('./Post');

const likeSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Like', likeSchema);
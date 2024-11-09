const mongoose = require('mongoose');

const postViewSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  viewedAt: { type: Date, default: Date.now },
  viewCount: { type: Number, default: 1 },
});

const PostView = mongoose.model('PostView', postViewSchema);

module.exports = PostView;
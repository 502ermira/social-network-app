const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  bookmarkedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
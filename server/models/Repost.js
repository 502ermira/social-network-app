const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const repostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  repostedAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Repost', repostSchema);
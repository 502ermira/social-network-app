const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Image = require('./Image');

const postSchema = new Schema({
  description: { type: String, required: false },
  sharedAt: { type: Date, default: Date.now },
  image: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Post', postSchema);
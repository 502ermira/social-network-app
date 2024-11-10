const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');

const imageSchema = new Schema({
  image: { type: String, required: true },
  embedding: { type: [Number], required: true }, 
  createdAt: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Image', imageSchema);
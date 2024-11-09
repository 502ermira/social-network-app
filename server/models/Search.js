const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  type: { type: String, enum: ['images', 'users'], required: true },
  timestamp: { type: Date, default: Date.now },
});

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;
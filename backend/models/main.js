const mongoose = require("mongoose");

const mainSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    required: true,
    type: String,
  },
  urlToImage: {
    type: String,
  },
  category: {
    type: String,
  },
  views: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("main", mainSchema);

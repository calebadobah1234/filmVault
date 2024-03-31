const mongoose = require("mongoose");

const serMovieSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  img: {
    type: String,
    trim: true,
  },
  imdb: {
    type: String,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  downloads: {
    type: Array,
    trim: true,
  },
  categories: {
    type: Array,
    trim: true,
  },
});

module.exports = mongoose.model("SerMovie", serMovieSchema);

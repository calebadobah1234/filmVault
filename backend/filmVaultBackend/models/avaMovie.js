const mongoose = require("mongoose");

const avaMovieSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  img: {
    type: String,
    trim: true,
  },
  poster: {
    type: String,
    trim: true,
  },
  imdb: {
    type: Number,
  },
  about: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },

  categories: {
    type: Array,
    trim: true,
  },
  episodesData: {
    type: Array,
    trim: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  actors: {
    type: Array,
    trim: true,
  },
  movieInfo: {
    type: Object,
  },
  downloadData: {
    type: Array,
  },
  originalDescription: {
    type: String,
  },
  type: {
    type: String,
    default: "avaMovie",
  },
});

avaMovieSchema.index({ title: 1 });
avaMovieSchema.index({ title: "text" });

module.exports = mongoose.model("Avamovie", avaMovieSchema);

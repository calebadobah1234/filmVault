const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, default: "Anonymous" },
  createdAt: { type: Date, default: Date.now },
});

const aioAnimeSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  imageUrl: {
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
    default: "aioAnime",
  },
  comments: [commentSchema],
});

aioAnimeSchema.index({ title: 1 });
aioAnimeSchema.index({ title: "text" });

module.exports = mongoose.model("Aioanime", aioAnimeSchema);

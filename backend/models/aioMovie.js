const mongoose = require("mongoose");

const aioMovieSchema = new mongoose.Schema({
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
    default:
      "Bush embarks on the next chapter of his career and discovers that he is working with his former nemesis, Honey Chandler.",
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
    default: "aioMovie",
  },
});

aioMovieSchema.index({ title: 1 });
aioMovieSchema.index({ title: "text" });

module.exports = mongoose.model("Aiomovie", aioMovieSchema);

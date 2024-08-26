const mongoose = require("mongoose");

const slideShowSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  img: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("SlideShow", slideShowSchema);

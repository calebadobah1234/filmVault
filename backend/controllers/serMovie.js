const serMovie = require("../models/serMovie");

const get20ItemsM = async (req, res) => {
  const items = await serMovie.find({}).limit(50);
  res.status(200).json(items);
  console.log(items);
};

const getItemDetailsM = async (req, res) => {
  const item = await serMovie.findById(req.params.id);
  res.status(200).json(item);
  console.log(item);
};

const findItemsM = async (req, res) => {
  const item = await serMovie.find({
    title: { $regex: req.params.title, $options: "i" },
  });
  console.log(item);
  res.json(item);
};

const getRelatedContentM = async (req, res) => {
  const items = await serMovie.find({ category: req.params.category }).limit(3);
  console.log(items);
  res.send(items);
};

const addViewsM = async (req, res) => {
  const item = await serMovie.findByIdAndUpdate(
    { _id: req.params._id },
    { $inc: { views: 1 } },
    { new: true }
  );
  res.json(item);
};

const sortViewsM = async (req, res) => {
  try {
    const items = await serMovie.find({}).limit(5).sort({ views: -1 });
    res.status(200).json(items);
    console.log(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getPaginateContentM = async (req, res) => {
  const number = req.params.pass;
  const items = await serMovie
    .find({})
    .skip(number * 50)
    .limit(50);
  res.status(200).send(items);
  console.log(items);
  console.log(number);
};

module.exports = {
  get20ItemsM,
  getItemDetailsM,
  findItemsM,
  getRelatedContentM,
  addViewsM,
  sortViewsM,
  getPaginateContentM,
};

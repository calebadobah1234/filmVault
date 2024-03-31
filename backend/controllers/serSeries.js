const serSeries = require("../models/serSeries");

const get20ItemsS = async (req, res) => {
  const items = await serSeries.find({}).limit(50);
  res.status(200).json(items);
  console.log(items);
};

const getItemDetailsS = async (req, res) => {
  const item = await serSeries.findById(req.params.id);
  res.status(200).json(item);
  console.log(item);
};

const findItemsS = async (req, res) => {
  const item = await serSeries.find({
    title: { $regex: req.params.title, $options: "i" },
  });
  console.log(item);
  res.json(item);
};

const getRelatedContentS = async (req, res) => {
  try {
    const category = req.params.category; // Assuming you get the category from the request parameters
    const items = await serSeries
      .find({ categories: { $in: [new RegExp(category, "i")] } }) // Case-insensitive regex
      .limit(5);
    console.log(items); // Output items to debug
    res.send(items);
  } catch (error) {
    console.error(error); // Output the error for debugging
    res.status(500).send("Internal Server Error");
  }
};

const addViewsS = async (req, res) => {
  const item = await serSeries.findByIdAndUpdate(
    { _id: req.params._id },
    { $inc: { views: 1 } },
    { new: true }
  );
  res.json(item);
};

const sortViewsS = async (req, res) => {
  try {
    const items = await serSeries.find({}).limit(5).sort({ views: -1 });
    res.status(200).json(items);
    console.log(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getPaginateContentS = async (req, res) => {
  const number = req.params.pass;
  const items = await serSeries
    .find({})
    .skip(number * 50)
    .limit(50);
  res.status(200).send(items);
  console.log(items);
  console.log(number);
};

module.exports = {
  get20ItemsS,
  getItemDetailsS,
  findItemsS,
  getRelatedContentS,
  addViewsS,
  sortViewsS,
  getPaginateContentS,
};

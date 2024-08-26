const main = require("../models/main");
const Main = require("../models/main");

const get20Items = async (req, res) => {
  const items = await Main.find({}).limit(50).sort({ publishedAt: -1 });
  res.status(200).json(items);
  console.log(items);
};

const getItemDetails = async (req, res) => {
  const item = await Main.findById(req.params.id);
  res.status(200).json(item);
  console.log(item);
};

const findItems = async (req, res) => {
  const item = await Main.find({
    title: { $regex: req.params.title, $options: "i" },
  });
  console.log(item);
  res.json(item);
};

const getRelatedContent = async (req, res) => {
  const items = await main.find({ category: req.params.category }).limit(3);
  console.log(items);
  res.send(items);
};

const addViews = async (req, res) => {
  const item = await Main.findByIdAndUpdate(
    { _id: req.params._id },
    { $inc: { views: 1 } },
    { new: true }
  );
  res.json(item);
};

const sortViews = async (req, res) => {
  try {
    const items = await Main.find({}).limit(5).sort({ views: -1 });
    res.status(200).json(items);
    console.log(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getPaginateContent = async (req, res) => {
  const number = req.params.pass;
  const items = await Main.find({})
    .skip(number * 50)
    .limit(50);
  res.status(200).send(items);
  console.log(items);
  console.log(number);
};

module.exports = {
  get20Items,
  getItemDetails,
  findItems,
  getRelatedContent,
  addViews,
  sortViews,
  getPaginateContent,
};

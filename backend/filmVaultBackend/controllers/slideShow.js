const SlideShow = require("../models/sideShow");

const findSLideShowItems = async (req, res) => {
  try {
    const items = await SlideShow.find({}).limit(4);
    res.status(200).json(items);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  findSLideShowItems,
};

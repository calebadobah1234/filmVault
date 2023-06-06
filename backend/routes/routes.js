const express = require("express");
const router = express.Router();

const {
  get20Items,
  getItemDetails,
  findItems,
  getRelatedContent,
  addViews,
  sortViews,
  getPaginateContent,
} = require("../controllers/main");

router.route("/get-20-items").get(get20Items);
router.route("/get-item-details/:id").get(getItemDetails);
router.route("/search/:title").get(findItems);
router.route("/get-related-content/:category").get(getRelatedContent);
router.route("/add-views/:_id").post(addViews);
router.route("/sort-views").get(sortViews);
router.route("/get-paginate-content/:pass").get(getPaginateContent);
module.exports = router;

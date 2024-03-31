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
const {
  get20ItemsM,
  getItemDetailsM,
  findItemsM,
  getRelatedContentM,
  addViewsM,
  sortViewsM,
  getPaginateContentM,
} = require("../controllers/serMovie");

const {
  get20ItemsS,
  getItemDetailsS,
  findItemsS,
  getRelatedContentS,
  addViewsS,
  sortViewsS,
  getPaginateContentS,
} = require("../controllers/serSeries");

const { register, login, authentication } = require("../controllers/auth");

router.route("/get-20-items").get(get20Items);
router.route("/get-item-details/:id").get(getItemDetails);
router.route("/search/:title").get(findItems);
router.route("/get-related-content/:category").get(getRelatedContent);
router.route("/add-views/:_id").post(addViews);
router.route("/sort-views").get(sortViews);
router.route("/get-paginate-content/:pass").get(getPaginateContent);
router.route("/register").post(register);
router.route("/login").post(login);

router.route("/get-20-itemsM").get(get20ItemsM);
router.route("/get-item-detailsM/:id").get(getItemDetailsM);
router.route("/searchM/:title").get(findItemsM);
router.route("/get-related-contentM/:category").get(getRelatedContentM);
router.route("/add-viewsM/:_id").post(addViewsM);
router.route("/sort-viewsM").get(sortViewsM);
router.route("/get-paginate-contentM/:pass").get(getPaginateContentM);

router.route("/get-20-itemsS").get(get20ItemsS);
router.route("/get-item-detailsS/:id").get(getItemDetailsS);
router.route("/searchS/:title").get(findItemsS);
router.route("/get-related-contentS/:category").get(getRelatedContentS);
router.route("/add-viewsS/:_id").post(addViewsS);
router.route("/sort-viewsS").get(sortViewsS);
router.route("/get-paginate-contentS/:pass").get(getPaginateContentS);

module.exports = router;

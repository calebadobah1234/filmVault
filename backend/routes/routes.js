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

// const {
//   get20ItemsS,
//   getItemDetailsS,
//   findItemsS,
//   getRelatedContentS,
//   addViewsS,
//   sortViewsS,
//   getPaginateContentS,
// } = require("../controllers/serSeries");

const {
  get20ItemsAm,
  getItemDetailsAm,
  findItemsAm,
  getRelatedContentAm,
  addViewsAm,
  sortViewsAm,
  getPaginateContentAm,
  getHighestRatedMoviesAm,
  getCategoryDataAm,
  getOtherActorMoviesAm,
  getCommentsAm,
  addCommentAm,
  getMoviesByYear,
  increaseSearchPriority,
} = require("../controllers/avaMovies");

const {
  get20ItemsAiom,
  getItemDetailsAiom,
  findItemsAiom,
  getRelatedContentAiom,
  addViewsAiom,
  sortViewsAiom,
  getPaginateContentAiom,
  getHighestRatedMoviesAiom,
  getCategoryDataAiom,
  getOtherActorMoviesAiom,
  getMoviesByYearAiom,
  increaseSearchPriorityAiom,
  addCommentAiom,
  getCommentsAiom,
} = require("../controllers/aioMovie");

const {
  get20ItemsAiome,
  getItemDetailsAiome,
  findItemsAiome,
  getRelatedContentAiome,
  addViewsAiome,
  sortViewsAiome,
  getPaginateContentAiome,
  getHighestRatedMoviesAiome,
  getCategoryDataAiome,
  getOtherActorMoviesAiome,
  getMoviesByYearAiome,
  increaseSearchPriorityAiome,
  addCommentAiome,
  getCommentsAiome,
} = require("../controllers/aioAnime");

const {
  get20ItemsAiokd,
  getItemDetailsAiokd,
  findItemsAiokd,
  getRelatedContentAiokd,
  addViewsAiokd,
  sortViewsAiokd,
  getPaginateContentAiokd,
  getHighestRatedMoviesAiokd,
  getCategoryDataAiokd,
  getOtherActorMoviesAiokd,
  getMoviesByYearAiokd,
  increaseSearchPriorityAiokd,
  addCommentAiokd,
  getCommentsAiokd,
} = require("../controllers/aioKdrama");

const { register, login, authentication } = require("../controllers/auth");
const { findSLideShowItems } = require("../controllers/slideShow");

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

// router.route("/get-20-itemsS").get(get20ItemsS);
// router.route("/get-item-detailsS/:id").get(getItemDetailsS);
// router.route("/searchS/:title").get(findItemsS);
// router.route("/get-related-contentS/:category").get(getRelatedContentS);
// router.route("/add-viewsS/:_id").post(addViewsS);
// router.route("/sort-viewsS").get(sortViewsS);
// router.route("/get-paginate-contentS/:pass").get(getPaginateContentS);

router.route("/get-20-itemsAm").get(get20ItemsAm);
router.route("/get-item-detailsAm/:title").get(getItemDetailsAm);
router.route("/searchAm").get(findItemsAm);
router.route("/get-related-contentAm").get(getRelatedContentAm);
router.route("/add-viewsAm/:_id").post(addViewsAm);
router.route("/sort-viewsAm").get(sortViewsAm);
router.route("/get-paginate-contentAm/:pass").get(getPaginateContentAm);
router.route("/get-highest-rated-moviesAm").get(getHighestRatedMoviesAm);
router.route("/get-category-dataAm").get(getCategoryDataAm);
router.route("/get-other-actor-movies/:actor").get(getOtherActorMoviesAm);
router.route("/get-movies-by-year").get(getMoviesByYear);
router.route("/increase-search-priority").post(increaseSearchPriority);
router.route("/commentAm/:id").get(getCommentsAm).post(addCommentAm);

router.route("/get-20-itemsAiom").get(get20ItemsAiom);
router.route("/get-item-detailsAiom/:title").get(getItemDetailsAiom);
router.route("/searchAiom").get(findItemsAiom);
router.route("/get-related-contentAiom").get(getRelatedContentAiom);
router.route("/add-viewsAiom/:_id").post(addViewsAiom);
router.route("/sort-viewsAiom").get(sortViewsAiom);
router.route("/get-paginate-contentAiom/:pass").get(getPaginateContentAiom);
router.route("/get-highest-rated-moviesAiom").get(getHighestRatedMoviesAiom);
router.route("/get-category-dataAiom").get(getCategoryDataAiom);
router.route("/get-other-actor-moviesAiom/:actor").get(getOtherActorMoviesAiom);
router.route("/get-movies-by-yearAiom").get(getMoviesByYearAiom);
router.route("/increase-search-priorityAiom").post(increaseSearchPriorityAiom);
router.route("/commentAiom/:id").get(getCommentsAiom).post(addCommentAiom);

router.route("/get-20-itemsAiokd").get(get20ItemsAiokd);
router.route("/get-item-detailsAiokd/:title").get(getItemDetailsAiokd);
router.route("/searchAiokd").get(findItemsAiokd);
router.route("/get-related-contentAiokd").get(getRelatedContentAiokd);
router.route("/add-viewsAiokd/:_id").post(addViewsAiokd);
router.route("/sort-viewsAiokd").get(sortViewsAiokd);
router.route("/get-paginate-contentAiokd/:pass").get(getPaginateContentAiokd);
router.route("/get-highest-rated-moviesAiokd").get(getHighestRatedMoviesAiokd);
router.route("/get-category-dataAiokd").get(getCategoryDataAiokd);
router
  .route("/get-other-actor-moviesAiokd/:actor")
  .get(getOtherActorMoviesAiokd);
router.route("/get-movies-by-yearAiokd").get(getMoviesByYearAiokd);
router
  .route("/increase-search-priorityAiokd")
  .post(increaseSearchPriorityAiokd);
router.route("/commentAiokd/:id").get(getCommentsAiokd).post(addCommentAiokd);

router.route("/get-20-itemsAiome").get(get20ItemsAiome);
router.route("/get-item-detailsAiome/:title").get(getItemDetailsAiome);
router.route("/searchAiome").get(findItemsAiome);
router.route("/get-related-contentAiome").get(getRelatedContentAiome);
router.route("/add-viewsAiome/:_id").post(addViewsAiome);
router.route("/sort-viewsAiome").get(sortViewsAiome);
router.route("/get-paginate-contentAiome/:pass").get(getPaginateContentAiome);
router.route("/get-highest-rated-moviesAiome").get(getHighestRatedMoviesAiome);
router.route("/get-category-dataAiome").get(getCategoryDataAiome);
router
  .route("/get-other-actor-moviesAiome/:actor")
  .get(getOtherActorMoviesAiome);
router.route("/get-movies-by-yearAiome").get(getMoviesByYearAiome);
router
  .route("/increase-search-priorityAiome")
  .post(increaseSearchPriorityAiome);
router.route("/commentAiome/:id").get(getCommentsAiome).post(addCommentAiome);

module.exports = router;

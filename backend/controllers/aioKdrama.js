const aioKdrama = require("../models/aioKdrama");

const handleServerError = (res, error) => {
  console.error("Server Error:", error);
  res.status(500).json({ error: "Internal Server Error" });
};

const get20ItemsAiokd = async (req, res) => {
  try {
    const items = await aioKdrama.find({}).limit(20).sort({ _id: -1 });
    res.status(200).json(items);
  } catch (error) {
    handleServerError(res, error);
  }
};

const getHighestRatedMoviesAiokd = async (req, res) => {
  try {
    const items = await aioKdrama.find({}).sort({ imdb: -1 }).limit(20);
    res.status(200).json(items);
  } catch (error) {
    handleServerError(res, error);
  }
};

const getItemDetailsAiokd = async (req, res) => {
  try {
    const { title } = req.params;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const item = await aioKdrama.find({ title }).limit(1);
    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    handleServerError(res, error);
  }
};

const findItemsAiokd = async (req, res) => {
  try {
    const { title, limit, skip } = req.query;
    if (!title) {
      return res.status(400).json({ error: "Search term is required" });
    }

    // Create regex patterns
    const escapedTitle = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const exactRegex = new RegExp(`^${escapedTitle}$`, "i");
    const containsRegex = new RegExp(escapedTitle, "i");
    const flexibleRegex = new RegExp(escapedTitle.split(/\s+/).join(".*"), "i");

    const pipeline = [
      {
        $match: {
          $or: [
            { title: { $regex: flexibleRegex } },
            { actors: containsRegex },
            { categories: containsRegex },
          ],
        },
      },
      {
        $addFields: {
          score: {
            $switch: {
              branches: [
                {
                  case: { $regexMatch: { input: "$title", regex: exactRegex } },
                  then: 5,
                },
                {
                  case: {
                    $regexMatch: { input: "$title", regex: containsRegex },
                  },
                  then: 4,
                },
                {
                  case: {
                    $regexMatch: { input: "$title", regex: flexibleRegex },
                  },
                  then: 3,
                },
                { case: { $in: [containsRegex, "$actors"] }, then: 2 },
                { case: { $in: [containsRegex, "$categories"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { score: -1, title: 1 } },
      { $skip: Number(limit) * (Number(skip) - 1) },
      { $limit: Number(limit) },
      { $project: { score: 0 } }, // Remove the score field from final results
    ];

    console.log("Aggregation pipeline:", JSON.stringify(pipeline));

    const [items, totalCount] = await Promise.all([
      aioKdrama.aggregate(pipeline),
      aioKdrama.countDocuments({
        $or: [
          { title: { $regex: flexibleRegex } },
          { actors: containsRegex },
          { categories: containsRegex },
        ],
      }),
    ]);

    console.log("Items found:", items.length);
    console.log("Total count:", totalCount);

    res.json({
      items,
      totalCount,
      currentPage: Number(skip),
      totalPages: Math.ceil(totalCount / Number(limit)),
    });
  } catch (error) {
    console.error("Error in findItemsAm:", error);
    handleServerError(res, error);
  }
};
const getRelatedContentAiokd = async (req, res) => {
  try {
    const { categories, actors, title } = req.query;

    if (!categories && !actors && !title) {
      return res.status(400).json({
        error: "At least one of categories, actors, or title is required",
      });
    }

    const categoriesArray = categories ? categories.split(",") : [];
    const actorsArray = actors ? actors.split(",") : [];

    // Create a base query that excludes exact title matches
    const baseQuery = {
      title: { $not: { $regex: `^${title}$`, $options: "i" } },
    };

    const pipeline = [
      { $match: baseQuery },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Category matching score
              {
                $multiply: [
                  {
                    $size: {
                      $ifNull: [
                        {
                          $setIntersection: [
                            { $ifNull: ["$categories", []] },
                            categoriesArray,
                          ],
                        },
                        [],
                      ],
                    },
                  },
                  2, // Weight for category matches
                ],
              },
              // Actor matching score
              {
                $multiply: [
                  {
                    $size: {
                      $ifNull: [
                        {
                          $setIntersection: [
                            { $ifNull: ["$actors", []] },
                            actorsArray,
                          ],
                        },
                        [],
                      ],
                    },
                  },
                  2, // Weight for actor matches
                ],
              },
              // Partial Title matching score
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$title", ""] },
                      regex: new RegExp(title.split(" ").join("|"), "i"),
                    },
                  },
                  3, // Weight for partial title matches
                  0,
                ],
              },
              // IMDB rating score
              { $ifNull: [{ $divide: [{ $ifNull: ["$imdb", 0] }, 2] }, 0] },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 12 },
    ];

    const items = await aioKdrama.aggregate(pipeline);

    res.status(200).json(items);
  } catch (error) {
    console.error("Server error:", error);
    handleServerError(res, error);
  }
};

const getCategoryDataAiokd = async (req, res) => {
  try {
    const category = req.query.category;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const skip =
      req.query.skip && req.query.limit && req.query.skip > 0
        ? (parseInt(req.query.skip) - 1) * limit
        : 0;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    let items, totalCount;

    if (category.toLowerCase() === "all") {
      // If category is "all", fetch all items
      items = await aioKdrama
        .find()
        .sort({ lastModified: -1, yearOfPublication: -1, _id: 1 })
        .skip(skip)
        .limit(limit);
      totalCount = await aioKdrama.countDocuments();
    } else {
      // Use the existing aggregation pipeline for specific categories
      const pipeline = [
        {
          $match: {
            categories: { $in: [new RegExp(category, "i")] },
          },
        },
        {
          $addFields: {
            categoryIndex: {
              $indexOfArray: [
                {
                  $map: {
                    input: "$categories",
                    as: "cat",
                    in: { $toLower: "$$cat" },
                  },
                },
                category.toLowerCase(),
              ],
            },
            yearOfPublication: { $toInt: "$movieInfo.yearOfPublication" },
          },
        },
        {
          $sort: {
            categoryIndex: 1,
            yearOfPublication: -1,
            lastModified: -1,
            _id: 1,
          },
        },
        {
          $facet: {
            paginatedResults: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const result = await aioKdrama.aggregate(pipeline);
      items = result[0].paginatedResults;
      totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
    }

    res.status(200).json({
      items: items,
      totalCount: totalCount,
    });
  } catch (error) {
    handleServerError(res, error);
  }
};
const getOtherActorMoviesAiokd = async (req, res) => {
  try {
    const { actor } = req.params;
    if (!actor) {
      return res.status(400).json({ error: "Actor name is required" });
    }
    const items = await aioKdrama
      .find({
        actors: { $in: [new RegExp(actor, "i")] },
      })
      .limit(30);
    res.status(200).json(items);
  } catch (error) {
    handleServerError(res, error);
  }
};

const addViewsAiokd = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({ error: "ID is required" });
    }
    const item = await aioKdrama.findByIdAndUpdate(
      _id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    handleServerError(res, error);
  }
};

const sortViewsAiokd = async (req, res) => {
  try {
    const items = await aioKdrama.find({}).limit(12).sort({ views: -1 });
    res.status(200).json(items);
  } catch (error) {
    handleServerError(res, error);
  }
};

const getPaginateContentAiokd = async (req, res) => {
  try {
    const { pass } = req.params;
    const number = parseInt(pass, 10);
    if (isNaN(number) || number < 0) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    const items = await aioKdrama
      .find({})
      .skip(number * 50)
      .limit(50);
    res.status(200).json(items);
  } catch (error) {
    handleServerError(res, error);
  }
};

const getMoviesByYearAiokd = async (req, res) => {
  try {
    const { year, limit, skip } = req.query;

    if (!year || isNaN(parseInt(year, 10))) {
      return res.status(400).json({ error: "Valid year is required" });
    }

    const query = { "movieInfo.yearOfPublication": year };

    const items = await aioKdrama
      .find(query)
      .skip(limit * (skip - 1))
      .limit(limit);

    const totalCount = await aioKdrama.countDocuments(query);

    res.status(200).json({
      items,
      totalCount,
      currentPage: parseInt(skip),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

const increaseSearchPriorityAiokd = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const increase = await aioKdrama.findOneAndUpdate(
      { title: title },
      { $inc: { searchPriority: 1 } },
      { new: true }
    );

    if (!increase) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(increase);
  } catch (error) {
    console.error("Error increasing search priority:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addCommentAiokd = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    const movie = await aioKdrama.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    movie.comments.push({ content, author });
    await movie.save();
    console.log(movie);
    console.log("done");

    res.status(201).json(movie);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

const getCommentsAiokd = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await aioKdrama.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie.comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};

module.exports = {
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
};

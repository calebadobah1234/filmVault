const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;
const connectDB = require("./db/connect");
const router = require("./routes/routes");
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

const start = () => {
  app.listen(port, async () => {
    try {
      await connectDB(
        "mongodb+srv://calebadobah1234:bananaman1234@crackxx.fxot0.mongodb.net/ai-blog?authSource=admin&replicaSet=atlas-edc7t5-shard-0&readPreference=primary&ssl=true"
      );
      console.log("connected to db port 3001");
    } catch (err) {
      console.log(err);
    }
  });
};
start();

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
      console.log("Connecting...");
      await connectDB("mongodb://localhost:27017");
      console.log("connected to db port 3001");
    } catch (err) {
      console.log(err);
      start();
    }
  });
};
start();

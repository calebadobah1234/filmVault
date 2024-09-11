const mongoose = require("mongoose");
const Aioanime = require("./path/to/your/aioanimeModel"); // Adjust this path

async function updateAioanimeTypes() {
  try {
    // Connect to your database
    await mongoose.connect("your_mongodb_connection_string", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to database");

    // Find all documents where type is not set
    const result = await Aioanime.updateMany(
      { type: { $exists: false } },
      { $set: { type: "aioAnime" } }
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error("Error updating documents:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

updateAioanimeTypes();

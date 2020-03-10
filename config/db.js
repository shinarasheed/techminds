const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectToDB = async () => {
  try {
    const connect = await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    console.log("connected to database successfully");
    return connect;
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectToDB;

const express = require("express");
const connectToDB = require("./config/db");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

connectToDB();

const app = express();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`app started on ${port}`);
});

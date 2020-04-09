const express = require("express");
const connectToDB = require("./config/db");
const path = require("path");

const dotenv = require("dotenv");

const userroutes = require("./routes/api/user");
const authroutes = require("./routes/api/auth");
const postroutes = require("./routes/api/post");
const profileroutes = require("./routes/api/profile");

dotenv.config({ path: "./config.env" });

const app = express();

connectToDB();

//bodyparser middleware

app.use(express.json({ extended: false }));

//routes middleware
app.use("/api/user", userroutes);
app.use("/api/auth", authroutes);
app.use("/api/profile", profileroutes);
app.use("/api/post", postroutes);

//this should always be done below the routes middleware

//serve static assets in production
if (process.env.NODE_ENV === "production") {
  //set stattic folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`app started on ${port}`);
});

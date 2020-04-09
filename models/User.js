const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  //we can add more validation
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  //we want the avater to be immedaitely available after the user register. ie even before they create a profile
  //they can choose to cahnge their avater after creating their profile
  avatar: {
    type: String
  },

  date: {
    type: Date,
    default: Date.now
  }
});

const UserCollection = mongoose.model("user", UserSchema);
module.exports = UserCollection;

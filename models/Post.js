const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  //every post must have a user
  //we make a reference to the user model
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },

  text: {
    type: String,
    required: true
  },

  name: {
    //this is the name of the user
    type: String
  },
  avatar: {
    type: String
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      }
    }
  ],

  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },

      text: {
        type: String,
        required: true
      },

      name: {
        //this is the name of the user
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = PostCollection = mongoose.model("post", PostSchema);

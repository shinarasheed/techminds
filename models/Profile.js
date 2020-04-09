const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  //every profile must be associated with a user
  //ie every profile must have a user
  //so we need to create a reference to the UsersCollection/Model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  company: {
    type: String
  },

  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    //skills is an array of strings
    type: [String],
    required: true
  },
  bio: {
    type: String
  },

  githubusername: {
    type: String
  },

  experience: [
    //experience is an array of experience objects
    {
      title: {
        type: String,
        required: true
      },

      company: {
        type: String,
        required: true
      },
      location: {
        type: String
      },

      from: {
        // type: Date,
        type: String,
        required: true
      },
      to: {
        // type: Date
        type: String
      },

      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  education: [
    //education is an array of education
    {
      school: {
        type: String,
        required: true
      },

      degree: {
        type: String,
        required: true
      },
      fieldofstudy: {
        type: String,
        required: true
      },
      from: {
        // type: Date,
        type: String,
        required: true
      },
      to: {
        // type: Date
        type: String
      },

      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  social: {
    //social is an object
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },

  date: {
    type: Date,
    default: Date.now
  }
});

//create and export the collection/model
const ProfileCollection = mongoose.model("profile", ProfileSchema);
module.exports = ProfileCollection;

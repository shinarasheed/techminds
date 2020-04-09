const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ProfileCollection = require("../../models/Profile");
const UserCollection = require("../../models/User");
const PostCollection = require("../../models/Post");
const { check, validationResult } = require("express-validator");
const request = require("request");

// @route GET api/profile/user
//@desc Get a user profile
//@access Private

//get user's profile when they log in for those who already have a profile created
router.get("/user", auth, async (req, res) => {
  try {
    //the user is from the token
    const profile = await ProfileCollection.findOne({
      user: req.user.id
    }).populate("user", ["name", "avater"]);

    if (!profile) {
      return res.status(404).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route POST api/profile
//@desc create a profile
//@access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .isEmpty(),
      check("skills", "skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile object
    const profileFields = {};
    //add a user to the profileField
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      //convert the skills to a comman seperated array
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    //build social object
    profileFields.social = {};
    //social is an object inside the profileField object
    //so we have to declare it that way
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      //we want to use this route to create or update a profile

      let profile = await ProfileCollection.findOne({ user: req.user.id });
      if (profile) {
        //if profile update
        profile = await ProfileCollection.findOneAndUpdate(
          {
            user: req.user.id
          },
          { $set: profileFields },
          { new: true }
        );

        return res.status(200).json(profile);
        //we are using return because if we are updating the profile,
        //then the rest shouldn't run
      }

      //if there is no profile create it
      profile = new ProfileCollection(profileFields);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route GET api/profile
//@decs  Get all profiles
//@access public

router.get("/", async (req, res) => {
  try {
    const profiles = await ProfileCollection.find().populate("user", [
      "name",
      "avatar"
    ]);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route GET api/profile/user/:user_id
//@decs  Get a user's profile
//@access public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await ProfileCollection.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(404).json({ msg: "profile not found" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    //if the error is a type of not valid object id
    //we do this instead of just getting a server error when the user enter a id that is not a valid object id
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "profile not found" });
    }
    res.status(500).send("server error");
  }
});

//@route DELETE api/profile/
//@decs  DELETE profile, user and post
//@access private

router.delete("/", auth, async (req, res) => {
  try {
    // @todo // remove user's post

    await PostCollection.deleteMany({ user: req.user.id });

    //remove profile
    await ProfileCollection.findOneAndRemove({
      //the req.user.id is coming from the token
      user: req.user.id
    });

    //remove user
    await UserCollection.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: "user deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route PUT api/profile/experience
//@decs add profile education (array)
//@access private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required")
        .not()
        .isEmpty(),
      check("company", "company is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await ProfileCollection.findOne({ user: req.user.id });
      //add to the profile array
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route DELETE api/profile/experience/:exp_id
//@decs delete experience form profile
//@access private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await ProfileCollection.findOne({ user: req.user.id });

    //get the index of the education you want to remove
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route GET api/profile/education
//@decs add profile education (array)
//@access private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required")
        .not()
        .isEmpty(),
      check("degree", "degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await ProfileCollection.findOne({ user: req.user.id });
      //add to the profile array
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route GET api/profile/education/:edu_id
//@decs delete education form profile
//@access private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await ProfileCollection.findOne({ user: req.user.id });

    //get the index of the education you want to remove
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route GET api/profile/github/:username
//@decs Get user repos from github
//@access public

router.get("/github/:username", async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENTID}&client_secret=${process.env.GITHUB_CLIENTSECRET}`,
      method: "GET",
      headers: { "user-agent": "node-js" }
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "No Github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;

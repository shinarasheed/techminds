const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const ProfileCollection = require('../../models/Profile');
const UserCollection = require('../../models/User');
const PostCollection = require('../../models/Post');

//@ POST /api/profile
//@desc create/update profile profile
//@access private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      status,
      skills,
      company,
      website,
      location,
      bio,
      githubusername,
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
    } = req.body;
    //create profile object
    const ProfileField = {};
    ProfileField.user = req.user;
    if (company) ProfileField.company = company;
    if (website) ProfileField.website = website;
    if (location) ProfileField.location = location;
    ProfileField.status = status;
    ProfileField.skills = skills.split(',').map((skill) => skill.trim());
    if (bio) ProfileField.bio = bio;
    if (githubusername) ProfileField.githubusername = githubusername;
    //social object
    ProfileField.social = {};
    if (facebook) ProfileField.social.facebook = facebook;
    if (twitter) ProfileField.social.twitter = twitter;
    if (youtube) ProfileField.social.youtube = youtube;
    if (linkedin) ProfileField.social.linkedin = linkedin;
    if (instagram) ProfileField.social.instagram = instagram;

    try {
      //if the profile already exist update it. if not create it
      //find a profile whose user is equal to the request user
      let profile = await ProfileCollection.findOne({ user: req.user });
      if (profile) {
        await ProfileCollection.findOneAndUpdate(
          { user: req.user },
          { $set: ProfileField },
          { new: true }
        );

        return res.status(200).json(profile);
      }
      //create the profile
      profile = new ProfileCollection(ProfileField);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

//where not /api/profile/:profileId
//@route GET /api/profile/user/:userId   //since this is public/. we dont have access to the req.user so will use the req.params.userId
//@decs  Get a user's profile
//@access public

//since this route is public, we could have done /api/profile/:profileId  I think
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await ProfileCollection.findOne({
      user: req.params.userId,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(404).json({ msg: 'profile not found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'profile not found' });
    }
    res.status(500).send('server error');
  }
});
//@ GET /api/profile/
//@desc get all profiles
//@access public
router.get('/', async (req, res) => {
  try {
    //populate the user's field with thier name and avatar
    //the user is a reference to the user field in the profile
    //use user instead of techuser.
    const profiles = await ProfileCollection.find().populate('user', [
      'name',
      'avatar',
    ]);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//@ DELETE /api/profile/user
//@desc delete a profile
//@access private
router.delete('/user', auth, async (req, res) => {
  try {
    //delete the profile
    await ProfileCollection.findOneAndRemove({ user: req.user });
    //delete the user's post
    await PostCollection.deleteMany({ user: req.user });
    //delete the user's account
    await UserCollection.findOneAndRemove({ _id: req.user });
    res.status(200).json({ msg: 'profile, post and account deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//@ PUT /api/profile/experience
//@desc add profile experience
//@access private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      from,
      location,
      to,
      current,
      description,
    } = req.body;

    try {
      const newExp = {
        title,
        company,
        from,
        location,
        to,
        current,
        description,
      };

      //find the profile to add the experience to
      const profile = await ProfileCollection.findOne({ user: req.user });
      if (!profile) {
        res.status(404).json({ msg: 'profile not found' });
      }

      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

//@ PUT /api/profile/education
//@desc add profile education
//@access private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty(),
    ],
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
      location,
      current,
      description,
    } = req.body;

    try {
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        location,
        current,
        description,
      };

      //find the profile to add the education to
      const profile = await ProfileCollection.findOne({ user: req.user });
      if (!profile) {
        res.status(404).json({ msg: 'profile not found' });
      }

      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

//@ DELETE /api/profile/experience/:expId
//@desc add profile education
//@access private

router.delete('/experience/:expId', auth, async (req, res) => {
  try {
    //get profile
    const profile = await ProfileCollection.findOne({ user: req.user });
    if (!profile) {
      return res.status(404).json({ msg: 'profile not found' });
    }
    // if (profile.user !== req.user) {
    //   return res.status(401).json({ msg: 'authorization denield' });
    // }
    const theExperience = profile.experience.find(
      //please dont use _id
      (exp) => exp.id === req.params.expId
      //this returns the object. GOOD
    );
    const experienceIndex = profile.experience.indexOf(theExperience);
    profile.experience.splice(experienceIndex, 1);
    await profile.save();
    res.status(200).json(profile.experience);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'profile not found' });
    }
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//@ DELETE /api/profile/education/:eduId
//@desc add profile education
//@access private

router.delete('/education/:eduId', auth, async (req, res) => {
  try {
    //get profile
    const profile = await ProfileCollection.findOne({ user: req.user });
    if (!profile) {
      return res.status(404).json({ msg: 'profile not found' });
    }
    // if (profile.user !== req.user) {
    //   return res.status(401).json({ msg: 'authorization denield' });
    // }
    const theEducation = profile.education.find(
      (edu) => edu.id === req.params.eduId
    );

    const educationIndex = profile.education.indexOf(theEducation);
    profile.education.splice(educationIndex, 1);
    await profile.save();
    res.status(200).json(profile.education);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'profile not found' });
    }
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// GET /api/profile/reepos
//@desc get user's gitub repo
//access public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENTID}&client_secret=${process.env.GITHUB_CLIENTSECRET}`,
      method: 'GET',
      headers: { 'user-agent': 'node-js' },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: 'No Github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

module.exports = router;

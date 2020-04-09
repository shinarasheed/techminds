const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const UserCollection = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//@route POST api/users
//@desc Register user
//@access public

router.post(
  "/",
  [
    check("name", "name is required")
      .not()
      .isEmpty(),
    check("email", "please include a valid email").isEmail(),
    check(
      "password",
      "please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if there are errors
    if (!errors.isEmpty()) {
      //400 is a user error
      return res.status(400).json({ errors: errors.array() });
    }

    //check if the user already exist
    const { name, email, password } = req.body;
    try {
      let user = await UserCollection.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exist" }] });
      }
      const avatar = gravatar.url(email, {
        s: "200",
        r: "g",
        d: "mm"
      });

      user = new UserCollection({
        name,
        email,
        avatar,
        password
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //save the user to the database
      await user.save();

      //what we are encodding is the user's id. since its a unique indentifier, we could have encoded the email
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          //we are not sending the user. we will be use another route to send the user after they send the token and we valiadte it that it is valid and get the user out of it
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;

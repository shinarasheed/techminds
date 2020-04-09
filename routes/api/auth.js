const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const UserCollection = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

//@route GET api/user
//@desc get loggedin user
//@access private

router.get("/user", auth, async (req, res) => {
  try {
    const user = await UserCollection.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route POST api/auth
//@desc login user
//@access public

router.post(
  "/",
  [
    check("email", "email is required").isEmail(),
    check("password", "password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await UserCollection.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      //compare passwords

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }
      //create payload
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
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;

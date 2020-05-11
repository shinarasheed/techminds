const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');
const UserCollection = require('../../models/User');

// POST /api/user
//@decs Register user
//@access public
router.post(
  '/',
  [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'please enter a valid email address').isEmail(),
    check(
      'password',
      'plaese enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, password, email } = req.body;

      let user = await UserCollection.findOne({ email: email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'user already exist' }] });
      }

      const avatar = gravatar.url(email, { s: '200', p: 'g', d: 'mm' });

      user = new UserCollection({
        name,
        password,
        email,
        avatar,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('JWT_SECRET'),
        { expiresIn: 86400000 },
        (err, token) => {
          if (err) throw err;

          res.status(200).json({ token: token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;

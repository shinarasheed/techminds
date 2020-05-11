const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const UserCollection = require('../../models/User');

//@GET /api/auth/user
//desc load authenticated user
//@access private

router.get('/', auth, async (req, res) => {
  //return the user making the request without the password
  const user = await UserCollection.findById(req.user).select('-password');
  res.status(200).json(user);
});

//@GET /api/auth/user
//desc all registered user
//assuming you are an admin
//@access private
router.get('/user/all', auth, async (req, res) => {
  const user = await UserCollection.find().select('-password');
  res.status(200).json(user);
});

//@GET /api/auth
//desc login user
//@access public
router.post(
  '/',
  [
    check('email', 'email is required').isEmail(),
    check('password', 'password is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      //check if email exist
      const user = await UserCollection.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      //compare the passwords
      const Match = await brcypt.compare(password, user.password);
      if (!Match) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      //generate the token
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
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;

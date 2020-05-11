const express = require('express');
const connectToDB = require('./config/db');
const user = require('./routes/api/user');
const auth = require('./routes/api/auth');
const post = require('./routes/api/post');
const profile = require('./routes/api/profile');

const app = express();

connectToDB();

//bodyparser middleware
app.use(express.json({ extended: false }));

//routes middleware
app.use('/api/user', user);
app.use('/api/auth', auth);
app.use('/api/post', post);
app.use('/api/profile', profile);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`app started on ${port}`);
});

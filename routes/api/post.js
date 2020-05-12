const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const UserCollection = require('../../models/User');
const PostCollection = require('../../models/Post');

//PSOT /api/post
//@decs create post
//@access private

router.post(
  '/',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //post has user,text, name, avatar. we would add the likes and comment through a seperate route
      const { text } = req.body;
      //create the post. but first get the details of the user making the post
      const user = await UserCollection.findById(req.user).select('-password');

      const newPost = new PostCollection({
        text,
        name: user.name,
        avatar: user.avatar,
        user: req.user,
      });

      const post = await newPost.save();
      res.status(200).json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

//GET /api/post
//@decs get all posts
//@access private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await PostCollection.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//GET /api/post/:postId
//@decs get a single post
//@access private

router.get('/:postId', auth, async (req, res) => {
  try {
    const post = await PostCollection.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    res.status(200).json(post);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'post not found' });
    }
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//DELETE /api/post/:postId
//@decs delete a post
//@access private
router.delete('/:postId', auth, async (req, res) => {
  try {
    //get the post to delete. but makesure it belongs to the user
    const post = await PostCollection.findById(req.params.postId);
    //is the req.user a string
    if (post.user.toString() !== req.user) {
      return res.status(401).json({ msg: 'you cannnot delete this post' });
    }
    //why not do this
    // await PostCollection.findOneAndRemove(req.params.postId);
    await post.remove(req.params.postId);
    res.status(200).json({ msg: 'post deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//PUT api/post/like/:postId
//@desc like a post
//@access private

router.put('/like/:postId', auth, async (req, res) => {
  try {
    //get the post being liked
    const post = await PostCollection.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    //post cannot be liked more than once by a user

    const likeLength = post.likes.filter(
      (like) => like.user.toString() === req.user
    ).length;
    if (likeLength > 0) {
      return res.status(400).json({ msg: 'post already liked by you' });
    }
    //likes is an array. and every like object has a user property
    post.likes.unshift({ user: req.user });
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'post not found' });
    }
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//PUT api/post/unlike/:postId
//@desc unlike a post
//@access private

router.put('/unlike/:postId', auth, async (req, res) => {
  try {
    //get the post to be unliked
    const post = await PostCollection.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    //SHINA. PLEASE FILTER RETURNS AN ARRAY. LET THAT SINK INTO YOUR HEAD
    const user = post.likes.filter((like) => like.user.toString() === req.user);
    if (user.length === 0) {
      return res.status(401).json({ msg: 'you cannot unlike this post' });
    }
    //find the like to be removed
    const likeToRemove = post.likes.find(
      (like) => like.user.toString() === req.user
    );
    //find the index of likeToRemove
    const indexOfLikeToRemove = post.likes.indexOf(likeToRemove);
    post.likes.splice(indexOfLikeToRemove, 1);
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'post not found' });
    }
    console.error(err.message);
    res.status(500).send('server error');
  }
});

//PUT api/post/comment/:postId
//@desc add comment to a post
//@access private
router.put(
  '/comment/:postId',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //post has user,text, name, avatar. we would add the likes and comment through a seperate route
      const { text } = req.body;
      //create the post. but first get the details of the user making the post
      const user = await UserCollection.findById(req.user).select('-password');

      //create the comment
      const newComment = {
        text,
        name: user.name,
        avatar: user.avatar,
        user: req.user,
      };

      //get the post
      const post = await PostCollection.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ msg: 'post not found' });
      }
      post.comments.unshift(newComment);
      await post.save();
      res.status(200).json(post.comments);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: 'post not found' });
      }
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

//PUT api/post/comment/:postId/:commentId
//@desc delete a comment from a post
//@access private

router.delete('/comment/:postId/:commentId', auth, async (req, res) => {
  try {
    //get the post to delete from
    const post = await PostCollection.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    //check if the user made the comment
    const user = post.comments.filter(
      (comment) => comment.user.toString() === req.user
    );
    if (user.length === 0) {
      return res.status(401).json({ msg: 'you cannot delete this comment' });
    }
    //find the comment to be deleted
    const commentToDelete = post.comments.find(
      (comment) => comment.id === req.params.commentId
    );
    //find the index of commentToDelete
    const indexOfCommentToDelete = post.comments.indexOf(commentToDelete);
    post.comments.splice(indexOfCommentToDelete, 1);
    await post.save();
    res.status(200).json(post.comments);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'post not found' });
    }
    console.error(err.message);
    res.status(500).send('server error');
  }
});

module.exports = router;

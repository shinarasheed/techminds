const express = require("express");
const router = express.Router();
const PostCollection = require("../../models/Post");
const ProfileCollection = require("../../models/Profile");
const UserCollection = require("../../models/User");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

//@route POST api/post
//@desc Create a post
//@access private

router.post(
  "/",
  [
    auth,
    [
      check("text", "text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await UserCollection.findById(req.user.id).select(
        "-password"
      );

      const newPost = new PostCollection({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.status(200).json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route GET api/post
//@desc GET all post
//@access private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await PostCollection.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route GET api/post/:post_id
//@desc GET a single post by id
//@access private

router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await PostCollection.findById(req.params.post_id);
    //check if there is a post with that id
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "post not found" });
    }
    res.status(500).send("server error");
  }
});

//@route DELETE api/post/:post_id
//@desc DELETE a single post by id
//@access private

router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await PostCollection.findById(req.params.post_id);
    //check if the post belongs to the user

    //this is not neccessary.
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: "you dont have permission to delete this post" });
    }

    await post.remove();
    res.status(200).json({ msg: "post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "post not found" });
    }
    res.status(500).send("server error");
  }
});

//@route PUT api/post/like/:id
//@desc Like a post
//@access private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await PostCollection.findById(req.params.id);
    //check if the post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route PUT api/post/like/:id
//@desc Unlike a post
//@access private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await PostCollection.findById(req.params.id);
    //check if the post has already been liked by this user
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "post has not been liked" });
    }
    //get the removed index
    const removedIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removedIndex, 1);
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route POST api/post/comment/:post_id
//@desc add a comment to a post
//@access private

router.post(
  "/comment/:post_id",
  [
    auth,
    [
      check("text", "text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //get th user
      const user = await UserCollection.findById(req.user.id).select(
        "-password"
      );
      //get the post we want to add a comment to
      const post = await PostCollection.findById(req.params.post_id);

      //create the new comment
      //the comment is not a document so we are not instanstiating a new post comment
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      //add the comment to the post comments array
      post.comments.unshift(newComment);
      await post.save();
      res.status(200).json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route POST api/post/comment/:post_id/:comment_id
//we need to know which post we are deleting a comment from
//@desc delete a comment to a post
//@access private

router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    //get post by id
    const post = await PostCollection.findById(req.params.post_id);

    //pull out comment

    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    //make sure comment exist
    if (!comment) {
      return res.status(404).json({ msg: "comment does not exist" });
    }

    //make sure the user deleting comment is the person that made the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }

    //get removed index
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);

    if (!post.comments.splice(removeIndex, 1)) {
      return res.status(500).json({ msg: "comment was not deleted" });
    }

    res.status(200).json({ msg: "comment deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//this last route
//the comment dont appear to be deleted

module.exports = router;

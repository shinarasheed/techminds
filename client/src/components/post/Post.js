import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "../Layouts/spinner";
import { getPost } from "../../actions/post";
import PostItem from "../posts/PostItem";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const Post = ({ getPost, post, loading, match }) => {
  useEffect(() => {
    getPost(match.params.id);
  }, [getPost]);

  return loading || post === null ? (
    <Spinner />
  ) : (
    <>
      <PostItem post={post} showActions={false} />
      <CommentForm postId={post._id} />
      <div className="commets">
        {post.comments.map((comment) => (
          // we need to pass in the postId to know which post to delete the comment from
          <CommentItem key={comment._id} comment={comment} postId={post._id} />
        ))}
      </div>
    </>
  );
};

Post.propTypes = {
  getPost: PropTypes.func.isRequired,
  // am getting an prop is required error while the post is still null
  //ie before the post is fetch
  // post: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  post: state.post.post,
  loading: state.post.loading,
});
export default connect(mapStateToProps, { getPost })(Post);

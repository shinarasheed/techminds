import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import Spinner from "../Layouts/spinner";
import { getProfileById } from "../../actions/profile";
import PropTypes from "prop-types";
import ProfileTop from "./ProfileTop";
import ProfileAbout from "./ProfileAbout";
import ProfileExperience from "./ProfileExperience";
import ProfileEducation from "./ProfileEducation";
import PorfileGithub from "./ProfileGithub";

const Profile = ({
  getProfileById,
  profile: { profile, loading },
  auth,
  match
}) => {
  useEffect(() => {
    //the profile id
    // props.match.params.id
    getProfileById(match.params.id);
  }, [getProfileById, match.params.id]);
  return (
    <>
      {profile === null || loading ? (
        <Spinner />
      ) : (
        <>
          {" "}
          user profile
          <Link to="/profiles" className="btn btn-light">
            {/* when we go back to profiles CLEAR_PROFILE is called so that we can clear the profile of the former user and fill profile with the profile of any other user we click again in profiles */}{" "}
            Back to Profile
          </Link>
          {/* if a user is loged in and he is the owner of the profile, enable to edit his profile */}
          {auth.isAuthenticated &&
          auth.loading === false &&
          auth.user._id === profile.user._id ? (
            <Link to="/edit-profile" className="btn btn-dark">
              Edit Profile
            </Link>
          ) : null}
          <div className="profile-grid my-1">
            <ProfileTop profile={profile} />
            <ProfileAbout profile={profile} />
            <div className="profile-exp bg-light p-2">
              <h2 className="text-primary">Experience</h2>
              {profile.experience.length > 0 ? (
                <>
                  {profile.experience.map(experience => (
                    <ProfileExperience
                      key={experience._id}
                      experience={experience}
                    />
                  ))}
                </>
              ) : (
                <h4> No Experience credentials </h4>
              )}
            </div>
            <div className="profile-edu bg-light p-2">
              <h2 className="text-primary">Education</h2>
              {profile.education.length > 0 ? (
                <>
                  {profile.education.map(education => (
                    <ProfileEducation
                      key={education._id}
                      education={education}
                    />
                  ))}
                </>
              ) : (
                <h4> No Education credentials </h4>
              )}
            </div>

            {/* check if there is a githubusername and then render the githubrepo component] */}
            {/* we can always use this syntax if the else is none */}
            {profile.githubusername && (
              <PorfileGithub username={profile.githubusername} />
            )}
          </div>
        </>
      )}
    </>
  );
};

Profile.propTypes = {
  getProfileById: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth
});
export default connect(mapStateToProps, { getProfileById })(Profile);

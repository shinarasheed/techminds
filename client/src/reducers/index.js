import { combineReducers } from 'redux';
import auth from './auth';
import profile from './profile';
import post from './post';
import alert from './alert';

export default combineReducers({
  auth,
  profile,
  post,
  alert,
});

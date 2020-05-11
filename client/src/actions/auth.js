import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
} from '../actions/types';
import setAuthToken from '../utils/setAuthToken';
import { setAlert } from '../actions/alert';
import axios from 'axios';

//THIS WOULD HAVE WPRKED REALLY FINE
//WE JUST DO EXACTLY WHAT WE WERE DOING ON THE BACKEND
//SENT THE TOKEN THROUGH THE REQUEST HEADER

// export const loadUser = () => async (dispatch) => {
//   try {
//     if (localStorage.token) {
//       const config = {
//         headers: {
//           'auth-token': localStorage.token,
//         },
//       };

//       const res = await axios.get('/api/auth/user/me', config);
//       dispatch({
//         type: USER_LOADED,
//         payload: res.data,
//       });
//     }
//   } catch (err) {
//     dispatch({
//       type: AUTH_ERROR,
//     });
//   }
// };

export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth');
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

export const registerUser = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  //the data is just a plain object.we need to convert it to a json object as we specified in our config before we send
  const body = JSON.stringify({ name, email, password });
  try {
    const res = await axios.post('/api/user', body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    const errors = err.response.data.errors;
    //display the errors
    if (errors) {
      errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    }

    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

export const loginUser = ({ email, password }) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post('/api/auth', body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      //the payload is the token coming from the backend
      payload: res.data,
    });
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    }
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

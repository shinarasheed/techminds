import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

//we would have other state which are just subsets of this the store state
//state for auth/user, profile, post etc
//and access them as and their properties from this state

//the store state is basically an object of other auth/user, profile, post state  object

//am cureent the store state is an object of other state object // you will be able to see this in the redux dev tools, looking under 'Raw' tab

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

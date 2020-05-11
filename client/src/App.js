import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Layouts/Navbar';
import PrivateRoute from './components/routing/Privateroute';
import Landing from './components/Layouts/Landing';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Notfound from './components/Layouts/Notfound';
import Alert from './components/Layouts/Alert';
import Dashboard from './components/dashboard/Dashboard';
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  //whenever the application mounts we want to run loadUser.
  //since we are not performing any event like button click etc
  //we can just do the below
  //why not just call loadUser instead of store.dispacth(loadUser())
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <>
      <Provider store={store}>
        <Router>
          <Navbar />
          <Route exact path='/' component={Landing} />
          <section className='container'>
            <Alert />
            <Switch>
              <Route exact path='/register' component={Register} />
              <Route exact path='/login' component={Login} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
              <Route component={Notfound} />
            </Switch>
          </section>
        </Router>
      </Provider>
    </>
  );
};

export default App;

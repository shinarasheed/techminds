import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Layouts/Navbar";
import Landing from "./components/Layouts/Landing";
import Routes from "./components/routing/Routes";

//Redux
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/auth";
import setAuthtoken from "./utils/setAuthtoken";

import "./App.css";
import NotFound from "./components/Layouts/NotFound";

if (localStorage.token) {
  setAuthtoken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route component={Routes} />
          </Switch>
        </>
      </Router>
    </Provider>
  );
};
export default App;

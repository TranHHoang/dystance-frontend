import React from "react";
import { hot } from "react-hot-loader";
import { LoginForm } from "../components/account-management/login/LoginForm";
import { BrowserRouter, Redirect, Route, Switch, HashRouter } from "react-router-dom";
import { RegisterForm } from "../components/account-management/RegisterForm";

export default hot(module)(function App() {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/register" component={RegisterForm} />
        <Route
          exact
          path="/"
          render={() => (
            <React.Fragment>
              <LoginForm />
              {/*<AddPostForm />*/}
              {/*<PostList />*/}
            </React.Fragment>
          )}
        />
      </Switch>
    </HashRouter>
  );
});

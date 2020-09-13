import React from "react";
import { hot } from "react-hot-loader";
import LoginForm from "../components/account-management/login/LoginForm";
import GoogleUpdateInfoForm from "../components/account-management/google-update-info/GoogleUpdateInfo";
import { HomePage } from "../components/homepage/Homepage";
import { Route, Switch, HashRouter } from "react-router-dom";
import RegisterForm from "../components/account-management/register/RegisterForm";

export default hot(module)(function App() {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/homepage" component={HomePage} />
        <Route exact path="/register" component={RegisterForm} />
        <Route exact path="/googleUpdateInfo" component={GoogleUpdateInfoForm} />
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

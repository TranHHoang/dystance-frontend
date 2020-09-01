import React from "react";
import { hot } from "react-hot-loader";
import { SignInForm } from "../components/account-management/sign-in/SignInForm";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { RegisterForm } from "../components/account-management/register/RegisterForm";

export default hot(module)(function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route
                    exact
                    path="/"
                    render={() => (
                        <React.Fragment>
                            <SignInForm />
                            {/*<AddPostForm />*/}
                            {/*<PostList />*/}
                        </React.Fragment>
                    )}
                />
                <Route exact path="/register" component={RegisterForm} />
                <Redirect to="/" />
            </Switch>
        </BrowserRouter>
    );
});

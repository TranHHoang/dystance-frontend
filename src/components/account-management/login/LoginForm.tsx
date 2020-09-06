import React, { useState } from "react";
import { Link } from "react-router-dom";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import config from "./googleConfigs.json";
import { useDispatch, useSelector } from "react-redux";
import { startLogin } from "./loginSlice";
import { RootState } from "$app/rootReducer";

export const LoginForm = () => {
  const [inputs, setInputs] = useState({
    emailOrUserName: "",
    password: ""
  });
  const dispatch = useDispatch();
  const userCredential = useSelector((state: RootState) => state.userCredential);

  const { emailOrUserName, password } = inputs;

  function onInputChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  function onFormSubmit() {
    if (emailOrUserName && password && !userCredential.isLoading) {
      const isEmail = /\@/.test(emailOrUserName);
      dispatch(startLogin(isEmail ? emailOrUserName : null, isEmail ? null : emailOrUserName, password, null));
    }
  }

  function onGoogleResponse(response: GoogleLoginResponse) {
    dispatch(startLogin(null, null, "", response.tokenId));
  }

  return (
    <div>
      <h1>Sign In</h1>
      <form>
        <label htmlFor="emailOrUserName">Email/User name:</label>
        <input
          type="text"
          name="emailOrUserName"
          id="emailOrUserName"
          value={emailOrUserName}
          onChange={onInputChanged}
          required={true}
        />

        <br />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={onInputChanged}
          required={true}
        />
        {/* TODO: Proper way to show error */}
        {userCredential.error && <div color="red">{userCredential.error && userCredential.error.message}</div>}
        {/* {userCredential.error && userCredential.error.type === 1 && <a href="#">Resend email</a>} */}

        <br />

        <Link to="/register">Create a new account</Link>

        <button type="button" onClick={onFormSubmit} disabled={userCredential.isLoading}>
          Sign In
        </button>

        <GoogleLogin
          clientId={config.GoogleClientId}
          onSuccess={onGoogleResponse}
          onFailure={(e) => console.log(e)}
          render={(renderProps) => <button onClick={renderProps.onClick}>Login with Google</button>}
          cookiePolicy={"single_host_origin"}
        />
      </form>
    </div>
  );
};

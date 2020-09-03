import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import config from "./googleConfigs.json";
import Axios from "axios";
import { saveToken } from "../../utils/tokenStorage";

interface LoginResponse {
  userName: string;
  token: string;
  expiredDate: Date;
  refreshToken: string;
}

export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const onSignInClicked = async () => {
    if (email && password) {
      setEmail("");
      setPassword("");

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await Axios.post("/login", formData, { headers: { ContentType: "multipart/form-data" } });

      const data: LoginResponse = response.data;

      if (data) {
        // TODO: Placeholder for success
        await saveToken(data.userName, data.token, data.refreshToken);
        history.push("/"); // Redirect to homepage
      }
    }
  };

  const onGoogleResponse = async (response: GoogleLoginResponse) => {
    const tokenBlob = new Blob([JSON.stringify({ tokenId: response.tokenId })], { type: "application/json" });

    const serverResponse = await Axios.post(config.GoogleAuthCallbackUrl, tokenBlob);
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={onEmailChanged} required={true} />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" value={password} onChange={onPasswordChanged} required={true} />
        <Link to="/register">Create a new account</Link>
        <button type="button" onClick={onSignInClicked}>
          Sign In
        </button>
        <GoogleLogin
          clientId={config.GoogleClientId}
          buttonText="Login with Google"
          onSuccess={onGoogleResponse}
          onFailure={onGoogleResponse}
        />
      </form>
    </div>
  );
};

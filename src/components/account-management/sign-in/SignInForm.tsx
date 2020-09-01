import React, { useState } from "react";
import { Link } from "react-router-dom";

export const SignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    const onSignInClicked = () => {
        if (email && password) {
            setEmail("");
            setPassword("");
        }
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
                <button type="submit" onClick={onSignInClicked}>
                    Sign In
                </button>
                <button>Sign In with Google</button>
            </form>
        </div>
    );
};

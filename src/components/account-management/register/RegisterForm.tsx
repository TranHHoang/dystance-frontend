import React, { useState } from "react";

export const RegisterForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [userName, setUserName] = useState("");
    const [realName, setRealName] = useState("");
    const [dob, setDob] = useState("");

    const onUserNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value);
    const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
    const onRePasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => setRePassword(e.target.value);
    const onRealNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => setRealName(e.target.value);
    const onDobChanged = (e: React.ChangeEvent<HTMLInputElement>) => setDob(e.target.value);

    const onRegisterClicked = () => {
        if (email && password) {
            setEmail("");
            setPassword("");
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form>
                <label htmlFor="userName">Username:</label>
                <input type="text" id="userName" value={userName} onChange={onUserNameChanged} required={true} />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={email} onChange={onEmailChanged} required={true} />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={onPasswordChanged} required={true} />

                <label htmlFor="rePassword">Re-enter password:</label>
                <input
                    type="password"
                    id="rePassword"
                    value={rePassword}
                    onChange={onRePasswordChanged}
                    required={true}
                />

                <label htmlFor="realName">Your name:</label>
                <input type="text" id="realName" value={realName} onChange={onRealNameChanged} required={true} />

                <label htmlFor="dob">Date of birth:</label>
                <input type="date" id="realName" value={dob} onChange={onDobChanged} required={true} />

                <button type="submit" onClick={onRegisterClicked}>
                    Register
                </button>
            </form>
        </div>
    );
};

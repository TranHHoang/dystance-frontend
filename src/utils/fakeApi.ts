import Axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { hostName } from "./hostUtils";

const mock = new MockAdapter(Axios, { delayResponse: 1000 });

// Username & password
mock.onPost(`${hostName}/api/users/login`).reply((config) => {
  const params = config.data as FormData;
  console.log(config.data);
  console.log(config.headers);

  const userName = params.get("userName");
  const password = params.get("password");
  const email = params.get("email");

  if ((userName && userName === "0") || (email && email === "a@a.com" && password === "0")) {
    return [
      200,
      {
        id: "5f4ef22a-7295-42d2-b311-7d31bfff4060",
        username: "hoang",
        jwtToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjVmNGVmMjJhLTcyOTUtNDJkMi1iMzExLTdkMzFiZmZmNDA2MCIsIm5iZiI6MTU5OTI5NTIxNSwiZXhwIjoxNTk5MzgxNjE0LCJpYXQiOjE1OTkyOTUyMTV9.NMmJPtBF3LbgW4vqtWpKcaWYppQRDb1iDnwOGLptb5M",
        refreshToken: "SJPrgD9dXDutLrpNQEHbu3SoUDIMW8xQ7Qn1SbgJYPAT7KZbMzCpqOJvM8JZ2DNBfq7EuklhXlB995eKXdllvQ==",
        expires: 86400
      }
    ];
  } else if (userName && userName !== "0") {
    return [
      400,
      {
        type: 0,
        message: "Username not found"
      }
    ];
  } else if (email && email === "b@a.com") {
    return [
      400,
      {
        type: 1,
        message: "Email is not confirmed"
      }
    ];
  } else if (email && email === "c@a.com") {
    return [
      400,
      {
        type: 0,
        message: "Email not found"
      }
    ];
  } else if (password === "1") {
    return [
      400,
      {
        type: 0,
        message: "Password is not correct"
      }
    ];
  } else {
    mock.restore();
  }
});

export default Axios;

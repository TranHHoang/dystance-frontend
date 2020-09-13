import Axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { hostName } from "~utils/hostUtils";

const mock = new MockAdapter(Axios, { delayResponse: 1000 });

mock.onPost(`${hostName}/api/users/register`).reply((config) => {
  const params = config.data as FormData;
  const userName = params.get("userName");
  const email = params.get("email");

  if ((userName && userName === "1") || (email && email === "a@a.com")) {
    return [
      500,
      {
        type: 1,
        message: "Account already exists"
      }
    ];
  } else if ((userName && userName === "0") || (email && email === "b@a.com")) {
    return [200, {}];
  }
});

export default Axios;

import Axios from "axios";
import keytar from "keytar";
import { getLoginData, saveLoginData } from "./tokenStorage";
import { hostName } from "~utils/hostUtils";
import { UserLoginData } from "~utils/types";

const userName = "userName";

Axios.interceptors.request.use(
  async (config) => {
    const url = config.url;

    const isPublicRoute = /api\/users\/(login|register|google)/.test(url);

    if (!isPublicRoute) {
      // only need token for api access
      const loginData = await getLoginData();
      config.headers["Authorization"] = `Bearer ${loginData.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401 || error.config._retry) {
      return Promise.reject(error);
    }

    error.config._retry = true;

    const userInfo = await getLoginData();

    try {
      const form = new FormData();
      form.append("accessToken", userInfo.accessToken);
      form.append("refreshToken", userInfo.refreshToken);

      console.log("Expired token, need refreshing...");

      const response: UserLoginData = await Axios.post(`${hostName}/api/users/refreshToken`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await saveLoginData(userName, {
        id: response.id,
        userName: response.userName,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });

      console.log("Refreshed fisnish. Resend request...");

      // Resend request
      error.response.configs.headers["Authorization"] = `Bearer ${response.accessToken}`;
      return Axios(error.response.config);
    } catch (e) {
      if (e.response.status === 401) await keytar.deletePassword("Dystance", userName);
      return Promise.reject(e);
    }
  }
);

export default Axios;

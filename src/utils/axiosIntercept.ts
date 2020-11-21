import Axios from "axios";
import { getLoginData, saveLoginData } from "./tokenStorage";
import { post } from "./axiosUtils";

Axios.interceptors.request.use(
  (config) => {
    const url = config.url;

    const isPublicRoute = /api\/users\/(login|register|google|resendEmail|resetPassword)/.test(url);

    if (!isPublicRoute) {
      // only need token for api access
      const loginData = getLoginData();
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

    const userInfo = getLoginData();

    try {
      const form = new FormData();
      form.append("accessToken", userInfo.accessToken);
      form.append("refreshToken", userInfo.refreshToken);

      console.log("Expired token, need refreshing...");

      const data = (await post(`/users/refreshToken`, form)).data;

      saveLoginData({
        id: data.id,
        userName: data.userName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

      console.log("Refreshed fisnish. Resend request...");

      // Resend request
      error.response.config.headers["Authorization"] = `Bearer ${data.accessToken}`;
      return Axios(error.response.config);
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
);

export default Axios;

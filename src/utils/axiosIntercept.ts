import Axios from "axios";
import keytar from "keytar";
import { getLoginData, saveLoginData } from "./tokenStorage";
import { hostName } from "$utils/hostUtils";

const userName = "userName";

Axios.interceptors.request.use(
  async (config) => {
    const url = config.url;

    const isPublicRoute = /api\/users\/(login|register|google)/.test(url);

    if (!isPublicRoute) {
      // only need token for api access
      const loginData = await getLoginData();

      config.headers["Authorization"] = `Bearer ${loginData.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status !== 401 || error.config._retry) {
      return Promise.reject(error);
    }

    error.config._retry = true;

    const userInfo = await getLoginData();

    try {
      const form = new FormData();
      form.append("accessToken", userInfo.token);
      form.append("refreshToken", userInfo.refreshToken);

      const response = (await Axios.post(`${hostName}/api/user?action=refreshToken`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      })) as { id: string; username: string; accessToken: string; refreshToken: string; expires: number };

      await saveLoginData(userName, {
        id: response.id,
        userName: response.username,
        token: response.accessToken,
        refreshToken: response.refreshToken
      });

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

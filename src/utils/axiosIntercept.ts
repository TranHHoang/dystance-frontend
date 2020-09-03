import Axios from "axios";
import keytar from "keytar";
import { getToken, saveToken } from "./tokenStorage";

const userName = "userName";

Axios.interceptors.request.use(
  async (config) => {
    const url = config.url;

    if (url.indexOf("/api/") !== -1) {
      // only need token for api access
      const apiConfig = await getToken(userName);

      config.headers["Authorization"] = `Bearer ${apiConfig.token}`;
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

    const apiConfig = await getToken(userName);

    try {
      const response = await Axios.post("/api/refresh-token", {
        refreshToken: apiConfig.refreshToken
      });

      await saveToken(userName, response.data.token, response.data.refreshtoken);

      // Resend request
      error.response.configs.headers["Authorization"] = `Bearer ${response.data.token}`;
      return Axios(error.response.config);
    } catch (e) {
      await keytar.deletePassword("Dystance", userName);
      return Promise.reject(e);
    }
  }
);

export default Axios;

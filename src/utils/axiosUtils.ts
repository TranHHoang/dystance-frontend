import { AxiosRequestConfig } from "axios";
import Axios from "~utils/fakeAPI";
import { hostName } from "./hostUtils";

export async function post(relativeUrl: string, data: FormData | object, options?: AxiosRequestConfig) {
  if (data instanceof FormData) {
    return Axios.post(`${hostName}/api/${relativeUrl}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      ...options
    });
  }
  return Axios.post(`${hostName}/api/${relativeUrl}`, data, options);
}

export async function get(relativeUrl: string) {
  return Axios.get(`${hostName}/api/${relativeUrl}`);
}

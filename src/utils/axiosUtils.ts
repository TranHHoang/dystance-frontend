import Axios from "~utils/fakeAPI";
import { hostName } from "./hostUtils";

export async function post(relativeUrl: string, form: FormData) {
  return Axios.post(`${hostName}/api/${relativeUrl}`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

export async function get(relativeUrl: string) {
  return Axios.get(`${hostName}/api/${relativeUrl}`);
}

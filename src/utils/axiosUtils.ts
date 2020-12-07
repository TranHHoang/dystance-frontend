import Axios from "~utils/fakeAPI";
import { hostName } from "./hostUtils";

export async function postJson(relativeUrl: string, data: any) {
  return Axios.post(`${hostName}/api/${relativeUrl}`, data);
}

export async function postForm(relativeUrl: string, form: FormData) {
  return Axios.post(`${hostName}/api/${relativeUrl}`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
}

export async function get(relativeUrl: string) {
  return Axios.get(`${hostName}/api/${relativeUrl}`);
}

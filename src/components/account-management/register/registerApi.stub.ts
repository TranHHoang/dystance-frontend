import Axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { hostName } from "$utils/hostUtils";

const mock = new MockAdapter(Axios, { delayResponse: 1000 });

mock.onPost(`${hostName}/api/users/register`).reply(200);

export default Axios;

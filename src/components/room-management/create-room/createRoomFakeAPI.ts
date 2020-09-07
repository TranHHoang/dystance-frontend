import Axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(Axios, { delayResponse: 1000 });

mock.onPost("/api/rooms/create").reply((config) => {
  const params = config.data as FormData;
  console.log(config.data);
  console.log(config.headers);

  const classroomName = params.get("name");
  const startDate = params.get("startDate");
  const startTime = params.get("startHour");
  const endTime = params.get("endHour");
  const endDate = params.get("endDate");
  const description = params.get("description");

  if (classroomName === "SWD") {
    return [500, { message: "Server error!!!!!!!!!!!!!!!" }];
  }
});

export default Axios;

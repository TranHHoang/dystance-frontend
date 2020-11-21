import _ from "lodash";
import { AllUsersInfo, User } from "~utils/types";

let users: { [id: string]: User } = {};

if (AllUsersInfo in sessionStorage) {
  users = _.transform(JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[], (acc, cur) => {
    acc[cur.id] = cur;
  });
}

export function getUser(id: string): User {
  if (!users) {
    users = _.transform(JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[], (acc, cur) => {
      acc[cur.id] = cur;
    });
  }

  return users[id] || {};
}

import * as React from "react";
import Axios from "~utils/axiosIntercept";
import MockAdapter from "axios-mock-adapter";
import { hostName } from "~utils/hostUtils";

// const mock = new MockAdapter(Axios, { delayResponse: 1000 });

// // Username & password
// // mock.onPost("/api/rooms/create").reply((config) => {
// //   const params = config.data as FormData;
// //   console.log(config.data);
// //   console.log(config.headers);

// //   const classroomName = params.get("name");
// //   const startDate = params.get("startDate");
// //   const startTime = params.get("startHour");
// //   const endTime = params.get("endHour");
// //   const endDate = params.get("endDate");
// //   const description = params.get("description");

// //   if (classroomName === "SWD") {
// //     return [200, { message: "Success" }];
// //   }
// //   if (classroomName === "ACC") {
// //     return [500, { message: "Server error!!!!!!!!!!!!!!!" }];
// //   }
// // });

// // mock.onGet("/api/rooms/getByUserId?id=1").reply(200, [
// //   {
// //     id: "1",
// //     name: "Lop nay ten dai vl khong chua duoc vi no qua dai cho nen phai teet",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
// //     startHour: "13:00",
// //     endHour: "13:00",
// //     description: "Hello From Isekai"
// //   },
// //   {
// //     id: "2",
// //     name: "ACC101",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image:
// //       "data:image/jpeg;base64,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",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Accounting Class"
// //   },
// //   {
// //     id: "3",
// //     name: "MAS291",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image:
// //       "data:image/jpeg;base64,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",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   },
// //   {
// //     id: "4",
// //     name: "PMG201c",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image:
// //       "data:image/jpeg;base64,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",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   },
// //   {
// //     id: "5",
// //     name: "JPD131",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   },
// //   {
// //     id: "6",
// //     name: "JPD121",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   },
// //   {
// //     id: "7",
// //     name: "SSC102",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   },
// //   {
// //     id: "8",
// //     name: "SWP409",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   },
// //   {
// //     id: "9",
// //     name: "HCM101",
// //     startDate: "01-01-2020",
// //     endDate: "01-01-2020",
// //     image: "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
// //     startHour: "12:00",
// //     endHour: "15:00",
// //     description: "Welcome to Math Class"
// //   }
// // ]);

// mock.onPost(`${hostName}/api/users/login`).reply((config) => {
//   const params = config.data as FormData;
//   console.log(config.data);
//   console.log(config.headers);
//   const userName = params.get("userName");
//   const password = params.get("password");
//   const email = params.get("email");

//   if ((userName && userName === "0") || (email && email === "a@a.com" && password === "0")) {
//     return [
//       200,
//       {
//         id: "5f4ef22a-7295-42d2-b311-7d31bfff4060",
//         userName: "hoang",
//         accessToken:
//           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjVmNGVmMjJhLTcyOTUtNDJkMi1iMzExLTdkMzFiZmZmNDA2MCIsIm5iZiI6MTU5OTI5NTIxNSwiZXhwIjoxNTk5MzgxNjE0LCJpYXQiOjE1OTkyOTUyMTV9.NMmJPtBF3LbgW4vqtWpKcaWYppQRDb1iDnwOGLptb5M",
//         refreshToken: "SJPrgD9dXDutLrpNQEHbu3SoUDIMW8xQ7Qn1SbgJYPAT7KZbMzCpqOJvM8JZ2DNBfq7EuklhXlB995eKXdllvQ==",
//         expires: 86400
//       }
//     ];
//   } else if (userName && userName !== "0") {
//     return [
//       400,
//       {
//         type: 0,
//         message: "Username not found"
//       }
//     ];
//   } else if (email && email === "b@a.com") {
//     return [
//       400,
//       {
//         type: 1,
//         message: "Email is not confirmed"
//       }
//     ];
//   } else if (email && email === "c@a.com") {
//     return [
//       400,
//       {
//         type: 0,
//         message: "Email not found"
//       }
//     ];
//   } else if (password === "1") {
//     return [
//       400,
//       {
//         type: 0,
//         message: "Password is not correct"
//       }
//     ];
//   } else {
//     mock.restore();
//   }
// });

// mock.onPost(`${hostName}/api/users/google`).reply(404);
// mock.onPost(`${hostName}/api/users/google/updateInfo`).reply(200, {
//   id: "5f4ef22a-7295-42d2-b311-7d31bfff4060",
//   userName: "hoang",
//   jwtToken:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjVmNGVmMjJhLTcyOTUtNDJkMi1iMzExLTdkMzFiZmZmNDA2MCIsIm5iZiI6MTU5OTI5NTIxNSwiZXhwIjoxNTk5MzgxNjE0LCJpYXQiOjE1OTkyOTUyMTV9.NMmJPtBF3LbgW4vqtWpKcaWYppQRDb1iDnwOGLptb5M",
//   refreshToken: "SJPrgD9dXDutLrpNQEHbu3SoUDIMW8xQ7Qn1SbgJYPAT7KZbMzCpqOJvM8JZ2DNBfq7EuklhXlB995eKXdllvQ==",
//   expires: 86400
// });
// mock.onPost(`${hostName}/api/users/resendEmail`).reply(200);

// mock.onPost(`${hostName}/api/users/register`).reply((config) => {
//   const params = config.data as FormData;
//   const userName = params.get("userName");
//   const email = params.get("email");

//   if ((userName && userName === "1") || (email && email === "a@a.com")) {
//     return [
//       500,
//       {
//         type: 1,
//         message: "Account already exists"
//       }
//     ];
//   } else if ((userName && userName === "0") || (email && email === "b@a.com")) {
//     return [200, {}];
//   }
// });

// mock.onPost(`${hostName}/api/users/google/updateInfo`).reply((config) => {
//   const params = config.data as FormData;
//   const userName = params.get("userName");

//   if (userName && userName === "1") {
//     return [
//       500,
//       {
//         type: 1,
//         message: "Account already exists"
//       }
//     ];
//   } else if (userName && userName === "0") {
//     return [
//       200,
//       {
//         id: "5f4ef22a-7295-42d2-b311-7d31bfff4060",
//         userName: "hoang",
//         jwtToken:
//           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjVmNGVmMjJhLTcyOTUtNDJkMi1iMzExLTdkMzFiZmZmNDA2MCIsIm5iZiI6MTU5OTI5NTIxNSwiZXhwIjoxNTk5MzgxNjE0LCJpYXQiOjE1OTkyOTUyMTV9.NMmJPtBF3LbgW4vqtWpKcaWYppQRDb1iDnwOGLptb5M",
//         refreshToken: "SJPrgD9dXDutLrpNQEHbu3SoUDIMW8xQ7Qn1SbgJYPAT7KZbMzCpqOJvM8JZ2DNBfq7EuklhXlB995eKXdllvQ==",
//         expires: 86400
//       }
//     ];
//   }
// });

export default Axios;

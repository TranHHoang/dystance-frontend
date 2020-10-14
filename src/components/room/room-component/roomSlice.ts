import { HubConnectionBuilder } from "@microsoft/signalr";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse, RoomAction, RoomActionType } from "~utils/types";
import { fetchLatestMessage } from "../chat/chatSlice";
import { setUserInfoList } from "../user-list/userListSlice";
import { UserInfo } from "~utils/types";

interface RoomState {
  roomId: string;
  isDrawerOpen: boolean;
  tabsetValue: string;
  error?: ErrorResponse;
}
const initialState: RoomState = {
  roomId: null,
  isDrawerOpen: false,
  tabsetValue: ""
};

const roomSlice = createSlice({
  name: "roomSlice",
  initialState,
  reducers: {
    setDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDrawerOpen = action.payload;
      state.error = undefined;
    },
    setTabsetValue(state, action: PayloadAction<string>) {
      state.tabsetValue = action.payload;
    }
  }
});
export default roomSlice.reducer;
export const { setDrawerOpen, setTabsetValue } = roomSlice.actions;

export const socket = new HubConnectionBuilder().withUrl(`${hostName}/socket`).build();

export function initSocket(roomId: string): AppThunk {
  return async (dispatch) => {
    if (socket && socket.state === "Disconnected") {
      console.log("Start socket...");
      await socket.start();
    }
    await socket.invoke(RoomAction, roomId, RoomActionType.Join, getLoginData().id);
    setTimeout(async () => {
      console.log("Someone joined");
      await socket.invoke(RoomAction, roomId, RoomActionType.Join, "1a449bd8-ccd8-4572-b907-f6003f7e902d");
    }, 5000);
    socket.on(RoomAction, async (data: string) => {
      const response = JSON.parse(data);
      switch (response.type) {
        case RoomActionType.Chat:
          console.log("New Message");
          dispatch(fetchLatestMessage(roomId));
          break;
        case RoomActionType.Join:
        case RoomActionType.Leave:
          console.log("Joined Room");
          console.log(response);
          const userInfoList: UserInfo[] = [];
          for (const id of response.payload) {
            console.log(id);
            const response = await Axios.get(`${hostName}/api/users/info?id=${id}`);
            const data = response.data as UserInfo;
            userInfoList.push(data);
          }
          dispatch(setUserInfoList(userInfoList));
          break;
      }
    });
    // socket.on("UserListChange", async (userIdList: string) => {
    //   console.log("Joined Room");
    //   console.log(userIdList);
    //   const userInfoList: UserInfo[] = [];
    //   for (const id of JSON.parse(userIdList)) {
    //     console.log(id);
    //     const response = await Axios.get(`${hostName}/api/users/info?id=${id}`);
    //     const data = response.data as UserInfo;
    //     userInfoList.push(data);
    //   }
    //   dispatch(setUserInfoList(userInfoList));
    // });
  };
}

export function removeListeners() {
  socket.off(RoomAction);
  console.log("Component Unmount");
}

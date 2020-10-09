import { HubConnectionBuilder } from "@microsoft/signalr";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse } from "~utils/types";
import { fetchLatestMessage } from "../chat/chatSlice";
import { setUserInfoList, UserInfo } from "../userList/userListSlice";

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
      await socket.invoke("JoinRoom", roomId, getLoginData().id);
    }
    socket.on("NewChat", () => {
      console.log("New Message");
      dispatch(fetchLatestMessage(roomId));
    });
    socket.on("join", async (userIdList: string) => {
      console.log("Joined Room");
      const userInfoList: UserInfo[] = [];
      // console.log(userIdList);
      for (const id of JSON.parse(userIdList)) {
        console.log(id);
        const response = await Axios.get(`${hostName}/api/users/info?id=${id}`);
        const data = response.data as UserInfo;
        userInfoList.push(data);
      }
      // console.log(userInfoList);
      dispatch(setUserInfoList(userInfoList));
    });
  };
}

export function removeListeners() {
  socket.off("Broadcast");
  socket.off("join");
  console.log("Component Unmount");
}

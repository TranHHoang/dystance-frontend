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
import { setKickOtherUser, setMuteOtherUser } from "../user-list/user-card/userCardSlice";

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
    socket.invoke(RoomAction, roomId, RoomActionType.Join, getLoginData().id);

    socket.on(RoomAction, async (data: string) => {
      console.log("Socket is running");
      const response = JSON.parse(data);
      switch (response.type) {
        case RoomActionType.Chat:
          console.log("New Message");
          dispatch(fetchLatestMessage(roomId));
          break;
        case RoomActionType.Join:
        case RoomActionType.Leave:
          console.log("Joined/Left Room");
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
        case RoomActionType.Mute:
          dispatch(setMuteOtherUser(true));
          break;
        case RoomActionType.Kick:
          dispatch(setKickOtherUser(true));
          break;
      }
    });
  };
}

export function removeListeners() {
  socket.off(RoomAction);
  console.log("Component Unmount");
}

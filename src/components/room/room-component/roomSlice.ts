import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { ErrorResponse, RoomAction, RoomActionType } from "~utils/types";
import { fetchLatestMessage } from "../../chat/chatSlice";
import { setUserInfoList } from "../user-list/userListSlice";
import { UserInfo } from "~utils/types";
import { toggleWhiteboard, setKickOtherUser, setMuteOtherUser } from "../user-list/user-card/userCardSlice";
import { socket } from "~app/App";
import { fetchAllGroups } from "../group/groupSlice";

export interface BreakoutGroup {
  id: string;
  roomPath: string;
  name: string;
  endTime: string;
}

interface RoomState {
  roomId: string;
  isDrawerOpen: boolean;
  tabsetValue: string;
  group?: BreakoutGroup;
  error?: ErrorResponse;
  chatBadge: number;
}
const initialState: RoomState = {
  roomId: null,
  isDrawerOpen: false,
  tabsetValue: "",
  chatBadge: 0
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
    },
    incrementChatBadge(state) {
      state.chatBadge += 1;
    },
    resetChatBadge(state) {
      state.chatBadge = 0;
    },
    resetRoomState(state) {
      // Do not reset group
      state = { ...initialState, group: state.group };
      return state;
    },
    switchToGroup(state, action: PayloadAction<BreakoutGroup>) {
      state.group = action.payload;
    }
  }
});
export default roomSlice.reducer;
export const {
  setDrawerOpen,
  setTabsetValue,
  resetRoomState,
  switchToGroup,
  incrementChatBadge,
  resetChatBadge
} = roomSlice.actions;

export function initSocket(roomId: string): AppThunk {
  return (dispatch) => {
    socket.invoke(RoomAction, roomId, RoomActionType.Join, getLoginData().id);

    socket.on(RoomAction, async (data: string) => {
      const response = JSON.parse(data);
      switch (response.type) {
        case RoomActionType.Chat:
          dispatch(fetchLatestMessage(roomId, undefined));
          if (response.payload !== getLoginData().id) {
            dispatch(incrementChatBadge());
          }
          break;
        case RoomActionType.Join:
        case RoomActionType.Leave:
          const userInfoList: UserInfo[] = [];
          for (const id of response.payload) {
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
        case RoomActionType.ToggleWhiteboard:
          dispatch(toggleWhiteboard());
          break;
        case RoomActionType.Group:
          dispatch(fetchAllGroups(roomId));
          break;
      }
    });
  };
}

export function removeListeners() {
  socket.off(RoomAction);
}

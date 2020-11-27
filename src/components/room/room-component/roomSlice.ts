import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { getLoginData } from "~utils/tokenStorage";
import { AllUsersInfo, ErrorResponse, RoomAction, RoomActionType, User } from "~utils/types";
import { fetchLatestMessage } from "../../chat/chatSlice";
import { setUserInfoList } from "../user-list/userListSlice";
import { UserInfo } from "~utils/types";
import { toggleWhiteboard, setKickOtherUser, setMuteOtherUser } from "../user-list/user-card/userCardSlice";
import { socket } from "~app/App";
import { fetchAllGroups } from "../group/groupSlice";
import { createNotification, NotificationType } from "~utils/notification";
import _ from "lodash";

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
  groupStopped: boolean;
  error?: ErrorResponse;
  chatBadge: number;
}
const initialState: RoomState = {
  roomId: null,
  isDrawerOpen: false,
  tabsetValue: "",
  groupStopped: false,
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
    },
    stopGroup(state) {
      state.groupStopped = true;
    },
    setRoomId(state, action: PayloadAction<string>) {
      state.roomId = action.payload;
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
  resetChatBadge,
  stopGroup,
  setRoomId
} = roomSlice.actions;

export function initSocket(roomId: string): AppThunk {
  return (dispatch) => {
    socket.invoke(RoomAction, roomId, RoomActionType.Join, getLoginData().id);
    const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];

    socket.on(RoomAction, async (data: string) => {
      const response = JSON.parse(data);
      switch (response.type) {
        case RoomActionType.Chat:
          dispatch(fetchLatestMessage(roomId, undefined));
          if (response.payload !== getLoginData().id) {
            const user = _.find(allUsers, { id: response.payload });
            dispatch(incrementChatBadge());
            createNotification(NotificationType.RoomNotification, `New message from ${user.userName}`);
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
          createNotification(NotificationType.RoomNotification, "You have been muted");
          break;
        case RoomActionType.Kick:
          dispatch(setKickOtherUser(true));
          createNotification(NotificationType.RoomNotification, "You have been kicked");
          break;
        case RoomActionType.ToggleWhiteboard:
          dispatch(toggleWhiteboard());
          createNotification(NotificationType.RoomNotification, "Your whiteboard permission has been changed");
          break;
        case RoomActionType.GroupNotification:
          dispatch(fetchAllGroups(roomId));
          createNotification(NotificationType.RoomNotification, "Breakout groups have been updated");
          break;
        case RoomActionType.StopGroup:
          dispatch(stopGroup());
          createNotification(NotificationType.RoomNotification, "All breakout groups have been stopped");
          break;
      }
    });
  };
}

export function removeListeners() {
  socket.off(RoomAction);
}

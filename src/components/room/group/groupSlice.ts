import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import _ from "lodash";
import moment from "moment";
import { socket } from "~app/App";
import { all, RoomAction, RoomActionType, getLoginData, get, hostName, post, Axios } from "~utils/index";

export interface BreakoutGroup {
  groupId?: string;
  name?: string;
  userIds: string[];
  startTime?: string;
  endTime?: string;
}

interface GroupState {
  groupId: string;
  breakoutGroup: BreakoutGroup[];
  isGroupJoined: boolean;
  isGroupLeft: boolean;
  mainRoomId: string;
}

const initialState: GroupState = {
  groupId: null,
  breakoutGroup: [],
  isGroupJoined: false,
  isGroupLeft: false,
  mainRoomId: null
};

const groupSlice = createSlice({
  name: "groupSlice",
  initialState,
  reducers: {
    setBreakoutGroups(state, action: PayloadAction<BreakoutGroup[]>) {
      state.breakoutGroup = action.payload;
    },
    addBreakoutGroup(state, action: PayloadAction<BreakoutGroup>) {
      state.breakoutGroup.push(action.payload);
    },
    removeBreakoutGroup(state, action: PayloadAction<string>) {
      state.breakoutGroup = _.reject(state.breakoutGroup, { groupId: action.payload });
    },
    updateBreakoutGroup(state, action: PayloadAction<BreakoutGroup>) {
      // Update user list only
      if (action.payload) {
        _.find(state.breakoutGroup, { groupId: action.payload.groupId }).userIds = action.payload.userIds;
      } else {
        state.breakoutGroup = [];
      }
    },
    setGroupJoined(state, action: PayloadAction<boolean>) {
      state.isGroupJoined = action.payload;
      state.isGroupLeft = !action.payload;
    },
    resetGroupJoinedLeftState(state) {
      state.isGroupJoined = false;
      state.isGroupLeft = false;
    },
    setGroupId(state, action: PayloadAction<string>) {
      state.groupId = action.payload;
    },
    setMainRoomId(state, action: PayloadAction<string>) {
      state.mainRoomId = action.payload;
    }
  }
});

export default groupSlice.reducer;

export const {
  setBreakoutGroups,
  addBreakoutGroup,
  removeBreakoutGroup,
  updateBreakoutGroup,
  setGroupJoined,
  resetGroupJoinedLeftState,
  setGroupId,
  setMainRoomId
} = groupSlice.actions;

export function createGroups(roomId: string, teacherId: string, groups: BreakoutGroup[]): AppThunk {
  return async (dispatch) => {
    await all(groups, async ({ name, userIds }) => {
      try {
        const form = new FormData();
        form.append("name", name);
        form.append("teacherId", teacherId);
        form.append("roomId", roomId);
        form.append("userIds", JSON.stringify(userIds || []));

        const response = await post("/rooms/groups/create", form);
        dispatch(addBreakoutGroup(response.data as BreakoutGroup));
      } catch (ex) {
        console.log(ex);
      }
    });
  };
}

export function deleteGroups(roomId: string, groupIds: string[]): AppThunk {
  return async (dispatch) => {
    await all(groupIds, async (groupId) => {
      try {
        await Axios.delete(`${hostName}/api/rooms?id=${groupId}`);
        dispatch(removeBreakoutGroup(groupId));
      } catch (ex) {
        console.log(ex);
      }
    });
  };
}

export function fetchAllGroups(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/rooms/groups/get?roomId=${roomId}`);
      dispatch(setBreakoutGroups(response.data as BreakoutGroup[]));
    } catch (ex) {
      console.log(ex);
    }
  };
}

export function updateGroups(roomId: string, groups: BreakoutGroup[]): AppThunk {
  return async (dispatch) => {
    await all(groups, async ({ groupId, userIds }) => {
      try {
        const form = new FormData();
        form.append("groupId", groupId);
        form.append("userIds", JSON.stringify(userIds));

        const response = await post("/rooms/groups/update", form);
        if (response.data === null) return;

        dispatch(updateBreakoutGroup(response.data));
      } catch (ex) {
        console.log(ex);
      }
    });
    await socket.invoke(RoomAction, roomId, RoomActionType.GroupNotification, getLoginData().id);
  };
}

export function resetGroups(roomId: string, groupIds: string[]): AppThunk {
  return async () => {
    await all(groupIds, async (groupId) => {
      try {
        await get(`/rooms/groups/reset?groupId=${groupId}`);
      } catch (ex) {
        console.log(ex);
      }
    });
    await socket.invoke(RoomAction, roomId, RoomActionType.GroupNotification, getLoginData().id);
  };
}

export function startNewSession(roomId: string, duration: number, groupIds: string[]): AppThunk {
  return async (dispatch) => {
    const startTime = moment().toISOString();
    try {
      const form = new FormData();
      form.append("roomId", roomId);
      form.append("startTime", startTime);
      form.append("duration", duration.toString());
      await post("/rooms/groups/start", form);
    } catch (ex) {
      console.log(ex);
    }
    await socket.invoke(RoomAction, roomId, RoomActionType.GroupNotification, getLoginData().id);
    if (duration === 0) {
      await socket.invoke(RoomAction, roomId, RoomActionType.StopGroup, JSON.stringify(groupIds));
    }
    dispatch(fetchAllGroups(roomId));
  };
}

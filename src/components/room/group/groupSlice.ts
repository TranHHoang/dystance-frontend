import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "~app/store";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { post, get } from "~utils/axiosUtils";
import _ from "lodash";
import moment from "moment";
import { socket } from "~app/App";
import { RoomAction, RoomActionType } from "~utils/types";
import { getLoginData } from "~utils/tokenStorage";

export interface BreakoutGroup {
  groupId?: string;
  name?: string;
  userIds: string[];
  startTime?: string;
  endTime?: string;
}

const groupSlice = createSlice({
  name: "groupSlice",
  initialState: [] as BreakoutGroup[],
  reducers: {
    setBreakoutGroups(state, action: PayloadAction<BreakoutGroup[]>) {
      state = action.payload;
      return state;
    },
    addBreakoutGroup(state, action: PayloadAction<BreakoutGroup>) {
      state.push(action.payload);
    },
    removeBreakoutGroup(state, action: PayloadAction<string>) {
      state = _.reject(state, { groupId: action.payload });
      return state;
    },
    updateBreakoutGroup(state, action: PayloadAction<BreakoutGroup>) {
      // Update user list only
      if (action.payload) {
        _.find(state, { groupId: action.payload.groupId }).userIds = action.payload.userIds;
      } else {
        return [];
      }
    }
  }
});

export default groupSlice.reducer;

export const { setBreakoutGroups, addBreakoutGroup, removeBreakoutGroup, updateBreakoutGroup } = groupSlice.actions;

async function all<T>(array: T[], fn: (value: T) => Promise<void>) {
  return array.reduce(async (p, item) => {
    await p;
    return await fn(item);
  }, Promise.resolve());
}

export function createGroups(roomId: string, creatorId: string, groups: BreakoutGroup[]): AppThunk {
  return async (dispatch) => {
    await all(groups, async ({ name, userIds }) => {
      try {
        const form = new FormData();
        form.append("name", name);
        form.append("creatorId", creatorId);
        form.append("roomId", roomId);
        form.append("userIds", JSON.stringify(userIds || []));

        const response = await post("/rooms/groups/create", form);
        dispatch(addBreakoutGroup(response.data as BreakoutGroup));
      } catch (ex) {
        console.log(ex);
      }
    });
    await socket.invoke(RoomAction, roomId, RoomActionType.Group, getLoginData().id);
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
    await socket.invoke(RoomAction, roomId, RoomActionType.Group, getLoginData().id);
  };
}

export function fetchAllGroups(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await get(`/rooms/groups/get?roomId=${roomId}`);
      console.log(response.data);
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
    await socket.invoke(RoomAction, roomId, RoomActionType.Group, getLoginData().id);
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
    await socket.invoke(RoomAction, roomId, RoomActionType.Group, getLoginData().id);
  };
}

export function startNewSession(roomId: string, duration: number): AppThunk {
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
    await socket.invoke(RoomAction, roomId, RoomActionType.Group, getLoginData().id);
    dispatch(fetchAllGroups(roomId));
  };
}

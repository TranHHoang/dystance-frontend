import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Axios from "~utils/fakeAPI";
import { AppThunk } from "~app/store";
import { DeadlineInfo, ErrorResponse } from "~utils/types";
import { hostName } from "~utils/hostUtils";
import { AxiosError } from "axios";
import { CreateDeadlineFormValues } from "./DeadlineListComponent";
import moment from "moment";
import { Logger, LogType } from "~utils/logger";

interface DeadlineListState {
  isLoading: boolean;
  isDeadlineModalOpen: boolean;
  isDeadlineCreationSuccess: boolean;
  deadlines: DeadlineInfo[];
  error?: ErrorResponse;
}

const initialState: DeadlineListState = {
  isLoading: false,
  isDeadlineModalOpen: false,
  isDeadlineCreationSuccess: false,
  deadlines: []
};

const deadlineListSlice = createSlice({
  name: "deadlineListSlice",
  initialState,
  reducers: {
    setDeadlineModalOpen(state, action: PayloadAction<boolean>) {
      state.isDeadlineModalOpen = action.payload;
      state.isDeadlineCreationSuccess = false;
      state.error = undefined;
    },
    deadlineCreationStart(state) {
      state.isLoading = true;
    },
    deadlineCreationSuccess(state) {
      state.isLoading = false;
      state.isDeadlineCreationSuccess = true;
      state.error = undefined;
    },
    deadlineCreationFailure(state, action: PayloadAction<ErrorResponse>) {
      state.isLoading = false;
      state.isDeadlineCreationSuccess = false;
      state.error = action.payload;
    },
    fetchDeadlinesSuccess(state, action: PayloadAction<DeadlineInfo[]>) {
      state.deadlines = state.deadlines.concat(action.payload);
      state.error = undefined;
    },
    fetchDeadlinesFailure(state, action: PayloadAction<ErrorResponse>) {
      state.error = action.payload;
    },
    resetDeadlines() {
      return initialState;
    }
  }
});
export default deadlineListSlice.reducer;
export const {
  setDeadlineModalOpen,
  deadlineCreationStart,
  deadlineCreationSuccess,
  deadlineCreationFailure,
  fetchDeadlinesSuccess,
  fetchDeadlinesFailure,
  resetDeadlines
} = deadlineListSlice.actions;

const logger = Logger.getInstance();
export function showDeadlines(roomId: string): AppThunk {
  return async (dispatch) => {
    try {
      const response = await Axios.get(`${hostName}/api/rooms/deadline/get?roomId=${roomId}`);
      const data = response.data as DeadlineInfo[];
      dispatch(fetchDeadlinesSuccess(data));
    } catch (ex) {
      const e = ex as AxiosError;
      if (e.response) {
        dispatch(fetchDeadlinesFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(fetchDeadlinesFailure({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(fetchDeadlinesFailure({ message: e.message, type: 3 }));
      }
    }
  };
}
export function createDeadline({
  title,
  deadlineTime,
  deadlineDate,
  description,
  roomId
}: CreateDeadlineFormValues): AppThunk {
  return async (dispatch) => {
    dispatch(deadlineCreationStart());
    console.log("Creation Start");
    try {
      const fd = new FormData();
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
      fd.append("title", title.trim());
      fd.append("deadlineTime", deadlineTime);
      fd.append("deadlineDate", moment(deadlineDate).format("YYYY-MM-DD"));
      fd.append("description", description);
      fd.append("roomId", roomId);

      await Axios.post(`${hostName}/api/rooms/deadline/create`, fd, config);
      dispatch(deadlineCreationSuccess());
      logger.log(LogType.DeadlineCreate, roomId, `Created a new deadline`);
      dispatch(resetDeadlines());
      dispatch(showDeadlines(roomId));
    } catch (ex) {
      const e = ex as AxiosError;
      if (e.response) {
        dispatch(deadlineCreationFailure(e.response.data as ErrorResponse));
      } else if (e.request) {
        dispatch(deadlineCreationFailure({ message: "Something went wrong", type: 2 }));
      } else {
        dispatch(deadlineCreationFailure({ message: e.message, type: 3 }));
      }
    }
  };
}

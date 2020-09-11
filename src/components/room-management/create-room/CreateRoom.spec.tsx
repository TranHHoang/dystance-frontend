import createRoomReducer, * as CreateRoomSlice from "./createRoomSlice";
import React from "react";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { reducer as formReducer, submit, initialize } from "redux-form";
import { CreateRoomForm, Form } from "./CreateRoomForm";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { Modal } from "react-rainbow-components";

const store = configureStore({
  reducer: combineReducers({
    roomCreation: createRoomReducer,
    form: formReducer
  })
});

const wrapper = mount(
  <Provider store={store}>
    <CreateRoomForm />
  </Provider>
);

describe("CreateRoomForm", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("opens modal when create room button is clicked", () => {
    wrapper.find("button").simulate("click");
    expect(wrapper.find(Modal).first().prop("isOpen")).toBe(true);
  });

  it("disables buttons when submitting", () => {
    const spy = jest.spyOn(CreateRoomSlice, "createRoom").mockReturnValue((dispatch) => {
      console.log("AAAA");
      dispatch(CreateRoomSlice.roomCreateStart());
    });

    // store.dispatch(initialize("createRoomForm", {
    //   classroomName: "SWD",
    //   startDate: new Date(),
    //   startTime: new Date().toLocaleTimeString("it-IT"),
    //   endTime: new Date().toLocaleTimeString("it-IT"),
    //   endDate: new Date(),
    //   description: ""
    // }));

    wrapper
      .find("input[name='classroomName']")
      .first()
      .simulate("change", { target: { value: "SWD" } });
    wrapper
      .find("input[name='startTime']")
      .first()
      .simulate("change", { target: { value: "00:00" } });
    wrapper
      .find("input[name='endTime']")
      .first()
      .simulate("change", { target: { value: "01:00" } });
    // wrapper.update()
    console.log(wrapper.find("input[name='classroomName']").props());

    wrapper.find("#submit-button").first().simulate("click");
    const submitButton = wrapper.find("#submit-button").first().prop("disabled");
    const cancelButton = wrapper.find("#cancel-button").first().prop("disabled");
    expect(cancelButton).toBe(true);
    expect(submitButton).toBe(true);
  });
});

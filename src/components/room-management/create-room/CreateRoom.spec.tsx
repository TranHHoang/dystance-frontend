import createRoomReducer, * as CreateRoomSlice from "./createRoomSlice";
import React from "react";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { reducer as formReducer } from "redux-form";
import CreateRoomForm from "./CreateRoomForm";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";

import { fireEvent, cleanup, waitFor } from "@testing-library/react";
import { Modal } from "react-rainbow-components";

let store: ReturnType<typeof configureStore>;
let wrapper: ReturnType<typeof mount>;

describe("CreateRoomForm", () => {
  beforeEach(() => {
    store = configureStore({
      reducer: combineReducers({
        createRoomState: createRoomReducer,
        form: formReducer
      })
    });
    wrapper = mount(
      <Provider store={store}>
        <CreateRoomForm />
      </Provider>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("renders", () => {
    const wrapper = shallow(
      <Provider store={store}>
        <CreateRoomForm />
      </Provider>
    ).dive();
    expect(wrapper.exists()).toBe(true);
  });

  it("opens modal when create room button is clicked", () => {
    wrapper.find("button").simulate("click");
    expect(wrapper.find(Modal).first().prop("isOpen")).toBe(true);
  });

  it("dispatch to store when form values are correct", async () => {
    const spy = jest.spyOn(CreateRoomSlice, "createRoom").mockReturnValue(jest.fn());

    wrapper.find("button").simulate("click");

    await waitFor(() => {
      const classroomName = wrapper.find("input[name='classroomName']");
      fireEvent.change(classroomName.getDOMNode(), { target: { value: "SWD" } });
    });

    const startTime = wrapper.find("input[name='startTime']");

    await waitFor(() => {
      fireEvent.change(startTime.getDOMNode(), { target: { value: "01:00" } });
    });

    console.log(startTime.debug());

    await waitFor(() => {
      const endTime = wrapper.find("input[name='endTime']");
      fireEvent.change(endTime.getDOMNode(), { target: { value: "02:00" } });
    });

    await waitFor(() => {
      const submitButton = wrapper.find("button[type='submit']");
      fireEvent.click(submitButton.getDOMNode());
    });

    expect(spy).toBeCalled();
  });

  it("render modal correctly", () => {
    expect(wrapper.find(Modal).exists()).toBe(true);
  });

  it("default Cancel & Save button state when modal is open", async () => {
    // jest.spyOn(CreateRoomSlice, "createRoom").mockReturnValue((dispatch) => {
    //   dispatch(CreateRoomSlice.roomCreateStart());
    // });
    wrapper.find("button").simulate("click");
    // wrapper.update();

    // console.log(wrapper.debug());

    const cancelButton = wrapper
      .findWhere((node) => node.type() && node.name() && node.text() === "Cancel")
      .hostNodes();

    const saveButton = wrapper.findWhere((node) => node.type() && node.name() && node.text() === "Save").hostNodes();

    expect(cancelButton.getDOMNode()).toBeEnabled();
    expect(saveButton.getDOMNode()).toBeEnabled();
    // expect(saveButton).toBeEnabled();

    // const showModalButton = container.querySelector("button");

    // await waitFor(() => {
    //   fireEvent.click(showModalButton);
    // });

    // const classroomName = container.querySelector("input[name='classroomName']");
    // await waitFor(() => {
    //   fireEvent.change(classroomName, { target: { value: "SWD" } });
    // });

    // const submitButton = container.querySelector("button[type='submit']");
    // await waitFor(() => {
    //   fireEvent.click(submitButton);
    // });

    // expect(submitButton).toBeDisabled();
  });
});

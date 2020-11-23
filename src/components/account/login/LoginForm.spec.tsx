import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import LoginForm from "./LoginForm";
import loginReducer, * as LoginSlice from "./loginSlice";

const store = configureStore({
  reducer: combineReducers({
    loginState: loginReducer
  })
});

const wrapper = mount(
  <Provider store={store}>
    <LoginForm />
  </Provider>
);

describe("Login Form Test Suite", () => {
  describe("render()", () => {
    it("renders correctly", () => {
      // expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe("Redux-form", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("disable login button while submitting", () => {
      const spy = jest.spyOn(LoginSlice, "startLogin").mockReturnValue((dispatch) => {
        dispatch(LoginSlice.loginStart());
      });

      wrapper.find("form").simulate("submit");
      const loginButton = wrapper.find("button[type='submit']");

      expect(loginButton.prop("disabled")).toBe(true);
      expect(spy).toBeCalled();
    });
  });
});

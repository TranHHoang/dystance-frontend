import React from "react";
import Enzyme, { shallow, render, mount } from "enzyme";
import toJson from "enzyme-to-json";
import LoginForm from "./LoginForm";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { reducer as formReducer } from "redux-form";
import { Provider, useDispatch } from "react-redux";
import loginReducer, * as LoginSlice from "./loginSlice";

const store = configureStore({
  reducer: combineReducers({
    loginState: loginReducer,
    form: formReducer
  })
});

const wrapper = mount(
  <Provider store={store}>
    <LoginForm />
  </Provider>
);

const mockedLoginState = {
  isLoading: true
};

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

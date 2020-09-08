import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { Application } from "react-rainbow-components";
import store from "./store";

const theme = {
  rainbow: {
    palette: {
      brand: "#80deea",
      mainBackground: "#303030"
    }
  }
};
ReactDOM.render(
  <Provider store={store}>
    <Application theme={theme}>
      <App />
    </Application>
  </Provider>,
  document.getElementById("root")
);

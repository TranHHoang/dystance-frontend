import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { Application } from "react-rainbow-components";
import store from "./store";
import styled from "styled-components";

import { Titlebar, Color } from "custom-electron-titlebar";

new Titlebar({
  backgroundColor: Color.fromHex("#36393f"),
  icon: "../assets/logo.png"
  // TODO: Add menu: null to release build
});

const theme = {
  rainbow: {
    palette: {
      brand: "#4ecca3",
      mainBackground: "#36393f"
    }
  }
};
const Container = styled.div`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
  height: 100%;
  overflow: auto;
`;
ReactDOM.render(
  <Provider store={store}>
    <Application theme={theme}>
      <Container>
        <App />
      </Container>
    </Application>
  </Provider>,
  document.getElementById("root")
);

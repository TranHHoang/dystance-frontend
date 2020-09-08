import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { Application } from "react-rainbow-components";
import store from "./store";
import styled from "styled-components";
const theme = {
  rainbow: {
    palette: {
      brand: "#80deea",
      mainBackground: "#303030"
    }
  }
};
const Container = styled.div`
  background-color: ${theme.rainbow.palette.mainBackground};
  height: 100%;
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

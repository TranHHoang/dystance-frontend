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
      brand: "#4ecca3",
      mainBackground: "#36393f"
    }
  }
};
const Container = styled.div`
  /* background: linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('https://images.wallpaperscraft.com/image/minimalism_sky_clouds_sun_mountains_lake_landscape_95458_1920x1080.jpg'); */

  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
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

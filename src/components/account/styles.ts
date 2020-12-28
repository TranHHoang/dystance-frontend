import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form } from "formik";
import { Button, Card, DatePicker, Input, Notification } from "react-rainbow-components";
import { Link } from "react-router-dom";
import styled from "styled-components";

export const BackgroundContainer = styled.div`
  /* background-image: url("https://images.wallpaperscraft.com/image/minimalism_sky_clouds_sun_mountains_lake_landscape_95458_1920x1080.jpg"); */
  background-image: url("https://images.unsplash.com/photo-1512977851705-67ee4bf294f4?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=783&q=80");
  background-size: cover;
  height: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
`;
export const Container = styled.div`
  margin: auto;
  width: 100%;
`;
export const StyledNotification = styled(Notification)`
  width: 80%;
  margin-top: 20px;
  border: 0;
  box-shadow: 0 0 0 0;
  h1 {
    font-size: 20px;
    line-height: 1.5;
  }
`;

export const NotificationContainer = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  margin: auto;
`;
export const Title = styled.h1`
  font-family: "Lato";
  font-size: 30px;
  text-align: center;
  font-weight: 500;
  color: ${(props) => props.theme.rainbow.palette.text.label};
  padding-bottom: 10px;
  padding-top: 15px;
`;
export const Register = styled.p`
  font-family: "Lato";
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 300;
  color: ${(props) => props.theme.rainbow.palette.text.label};
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: ${(props) => props.theme.rainbow.palette.brand.main};
  transition: 0.3s;
  :hover {
    text-decoration: underline;
    color: ${(props) => props.theme.rainbow.palette.brand.main};
    filter: brightness(80%);
  }
`;
export const StyledReturnLink = styled(StyledLink)`
  :hover {
    text-decoration: none;
    filter: brightness(100%);
  }
`;
export const StyledCard = styled(Card)`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  flex-direction: column;
  margin: 0 auto;
  width: 50%;
  min-width: 700px;
`;
export const StyledInput = styled(Input)`
  margin-bottom: 15px;

  label {
    font-size: 20px;
  }
  input,
  input:focus {
    padding: 25px 1rem 25px 2.35rem;
  }
`;
export const StyledForm = styled(Form)`
  padding: 20px;
  width: 80%;
  font-size: 1.5em;
`;
export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5% 0 10px 0;
`;
export const StyledButton = styled(Button)`
  margin: 10 0 10 0;
  padding: 10px;
  font-size: 20px;
`;
export const StyledGoogleIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 16px;
`;

export const ResendButton = styled(Button)`
  font-size: 20px;
  width: 100%;
  padding: 0;
`;
export const StyledDatePicker = styled(DatePicker)`
  label {
    font-size: 20px;
  }
  input,
  input:focus {
    padding: 25px 1rem 25px 2.35rem;
  }
`;

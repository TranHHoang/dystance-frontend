import styled from "styled-components";
import { Input, Button, Card, Notification } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form } from "formik";

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
`;
export const Register = styled.p`
  font-family: "Lato";
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 300;
  color: ${(props) => props.theme.rainbow.palette.text.label};
`;

export const StyledLink = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.rainbow.palette.brand.main};
  transition: 0.3s;
  :hover {
    text-decoration: underline;
    color: #006dcc;
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
  background-color: rgba(48, 48, 48, 0.3);
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

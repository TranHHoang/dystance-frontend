import { Form } from "formik";
import { Button, Card, DatePicker, FileSelector, Input } from "react-rainbow-components";
import styled from "styled-components";
export const Container = styled.div`
  padding: 20px;
  width: 100%;
`;
export const CardContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
`;
export const ImageContainer = styled.div`
  width: 125px;
  margin-right: 5%;
`;
export const TextContainer = styled.div`
  display: flex;
`;
export const StyledImage = styled.img`
  min-width: 125px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
`;
export const StyledCard = styled(Card)`
  height: auto;
  width: 50%;
  min-width: 600px;
`;
export const Title = styled.h1`
  font-size: 2.25em;
  font-weight: 400;
  color: white;
  padding-bottom: 20px;
`;
export const StyledFileSelector = styled(FileSelector)`
  margin-bottom: 15px;
  height: auto;
  label {
    font-size: 15px;
    align-self: flex-start;
    margin-bottom: 10px;
  }
`;
export const StyledInput = styled(Input)`
  margin-bottom: 15px;

  label {
    font-size: 15px;
    align-self: flex-start;
    margin-bottom: 10px;
  }
  input,
  input:focus {
    padding: 20px 1rem 20px 1.5rem;
  }
`;
export const StyledDatePicker = styled(DatePicker)`
  margin-bottom: 15px;
  label {
    font-size: 15px;
    align-self: flex-start;
  }
  input,
  input:focus {
    padding: 20px 1rem 20px 1.5rem;
  }
`;
export const StyledForm = styled(Form)`
  width: 70%;
`;
export const DisabledInput = styled(Input)`
  margin-bottom: 15px;

  label {
    font-size: 15px;
    align-self: flex-start;
  }
`;

export const StyledButton = styled(Button)`
  border: none;
  padding: 5px 0 0 5px;

  :focus {
    border: none;
    outline: 0;
    box-shadow: 0 0 0 black;
  }
`;
export const PeopleProfileContainer = styled(Container)`
  margin-left: 0px;
`;

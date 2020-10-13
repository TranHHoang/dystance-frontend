import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import {
  CardContainer,
  DisabledInput,
  ImageContainer,
  StyledCard,
  StyledDatePicker,
  StyledImage,
  Title,
  PeopleProfileContainer
} from "../profilePageStyles";
import { showPeopleProfile } from "./peopleProfileSlice";

export interface PeopleProfileFormValues {
  realName: string;
  userName: string;
  email: string;
  dob: Date;
}
const PeopleProfilePage = (props: any) => {
  const peopleProfileState = useSelector((state: RootState) => state.peopleProfileState);
  const dispatch = useDispatch();
  const { userId } = props;

  useEffect(() => {
    console.log(userId);
    dispatch(showPeopleProfile(userId));
    // console.log(peopleProfileState.user?.email);
    // console.log(peopleProfileState.user?.userName);
  }, []);
  return (
    <PeopleProfileContainer>
      <Title>{peopleProfileState.user?.realName}'s Profile</Title>
      <StyledCard>
        <CardContainer>
          <ImageContainer>
            <StyledImage src={`${hostName}/${peopleProfileState.user?.avatar}`} alt="" />
          </ImageContainer>
          <div>
            <DisabledInput name="email" type="email" label="Email" value={peopleProfileState.user?.email} readOnly />
            <DisabledInput
              name="userName"
              type="text"
              label="Username"
              value={peopleProfileState.user?.userName}
              readOnly
            />
            <DisabledInput
              name="realName"
              type="text"
              label="Real Name"
              value={peopleProfileState.user?.realName}
              readOnly
            />
            <StyledDatePicker
              name="dob"
              label="Date Of Birth"
              locale="en-GB"
              value={peopleProfileState.user?.dob || ""}
              readOnly
            />
          </div>
        </CardContainer>
      </StyledCard>
    </PeopleProfileContainer>
  );
};
export default PeopleProfilePage;

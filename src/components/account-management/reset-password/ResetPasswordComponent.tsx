import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { BackgroundContainer, Container, StyledCard, Title, StyledNotification } from "../styles";
import EmailForm from "./EmailForm";
import AccessCodeForm from "./AccessCodeForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { ProgressIndicator, ProgressStep } from "react-rainbow-components";
import styled from "styled-components";
import { resetError } from "./resetPasswordSlice";

const stepNames = ["step-1", "step-2", "step-3"];

const StyledIndicator = styled(ProgressIndicator)`
  width: 50vh;
  margin-bottom: 4vh;
  span {
    font-size: 16px;
  }
`;

export const ResetErrorNotification = styled(StyledNotification)`
  a {
    justify-content: center;
  }
`;

const ResetPasswordComponent = () => {
  const resetPasswordState = useSelector((state: RootState) => state.resetPasswordState);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetError());
  }, [resetPasswordState.currentStep, dispatch]);

  function getCurrentStepForm() {
    switch (resetPasswordState.currentStep) {
      case 0:
        return <EmailForm />;
      case 1:
        return <AccessCodeForm />;
      default:
        return <ChangePasswordForm />;
    }
  }

  return (
    <BackgroundContainer>
      <Container>
        <StyledCard>
          <Title>Reset your password</Title>
          <StyledIndicator currentStepName={stepNames[resetPasswordState.currentStep]}>
            <ProgressStep name="step-1" label="Get access code" />
            <ProgressStep name="step-2" label="Verify access code" />
            <ProgressStep name="step-3" label="Reset password" />
          </StyledIndicator>

          {resetPasswordState.error && (
            <ResetErrorNotification title={resetPasswordState.error.message} hideCloseButton={true} icon="error" />
          )}

          {getCurrentStepForm()}
        </StyledCard>
      </Container>
    </BackgroundContainer>
  );
};

export default ResetPasswordComponent;

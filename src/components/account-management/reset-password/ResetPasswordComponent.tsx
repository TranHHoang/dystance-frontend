import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { BackgroundContainer, Container, StyledCard, StyledNotification, Title } from "../login/styles";
import EmailForm from "./EmailForm";
import AccessCodeForm from "./AccessCodeForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { ProgressIndicator, ProgressStep, Notification } from "react-rainbow-components";
import styled from "styled-components";

const stepNames = ["step-1", "step-2", "step-3"];

const StyledIndicator = styled(ProgressIndicator)`
  width: 50vh;
  margin: 3vh;
  margin-bottom: 5vh;
`;

const StyledDiv = styled.div`
  padding: 10px;
  color: #fe4849;
`;

const ResetPasswordComponent = () => {
  const resetPasswordState = useSelector((state: RootState) => state.resetPasswordState);

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
        <Title>Reset your password</Title>

        <StyledCard>
          <StyledIndicator currentStepName={stepNames[resetPasswordState.currentStep]}>
            <ProgressStep
              name="step-1"
              label="Get access code"
              hasError={resetPasswordState.error && resetPasswordState.currentStep === 0}
            />
            <ProgressStep
              name="step-2"
              label="Verify access code"
              hasError={resetPasswordState.error && resetPasswordState.currentStep === 1}
            />
            <ProgressStep
              name="step-3"
              label="Reset password"
              hasError={resetPasswordState.error && resetPasswordState.currentStep === 2}
            />
          </StyledIndicator>

          {resetPasswordState.error && <StyledDiv>{resetPasswordState.error.message}</StyledDiv>}

          {getCurrentStepForm()}
        </StyledCard>
      </Container>
    </BackgroundContainer>
  );
};

export default ResetPasswordComponent;

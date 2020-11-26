import React, { useEffect, useState } from "react";
import { Button, Textarea, TimelineMarker, Avatar, Modal, Notification } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { StyledNotification } from "../../account-management/styles";
import { setInviteModalOpen, showInvitedUsers, startInvite } from "./inviteSlice";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { AllUsersInfo, User } from "~utils/types";
import { TextField, Dialog, createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { hostName } from "~utils/hostUtils";
import styled from "styled-components";
import _ from "lodash";
import { getLoginData } from "~utils/tokenStorage";
import InvitedUserCardComponent from "./invited-user-card-component/InvitedUserCardComponent";
import { kickInvitedUser, setKickModalOpen } from "./invited-user-card-component/invitedUserCardSlice";
import { StyledText } from "../..//homepage/single-room/styles";

export const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#4ecca3",
      contrastText: "#36393f"
    },
    background: {
      paper: "#36393f"
    },
    secondary: {
      main: "#4ecca3"
    }
  },
  overrides: {
    MuiInputBase: {
      root: {
        height: "2em"
      }
    }
  }
});

const StyledAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const StyledTimelineMarker = styled(TimelineMarker)`
  div {
    margin: 0px;
  }
  > div {
    margin-right: 16px;
  }
`;
const InvitedUserListContainer = styled.div`
  display: grid;
  border-radius: 0%;
  margin-bottom: 20px;
  max-height: 230px;
  overflow-y: auto;
  border-radius: 0.875rem;
`;
const StyledUserAvatar = styled(Avatar)`
  img {
    object-fit: cover;
  }
`;
const InviteForm = (props: any) => {
  const inviteState = useSelector((root: RootState) => root.inviteState);
  const allUsersInfo = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const [] = useState<User[]>();
  const invitedUserCardState = useSelector((state: RootState) => state.invitedUserCardState);
  const dispatch = useDispatch();
  const { roomId } = props;
  const [emailList, setEmailList] = useState<string[]>();
  const [message, setMessage] = useState("");

  function onSendInvite() {
    if (emailList) {
      dispatch(startInvite(inviteState.roomId, emailList, message));
    }
  }

  useEffect(() => {
    dispatch(setInviteModalOpen({ roomId, isModalOpen: false }));
  }, [dispatch, inviteState.isSuccess, roomId]);

  useEffect(() => {
    setEmailList(undefined);
    setMessage("");
    if (inviteState.roomId === roomId && inviteState.isModalOpen === true) {
      dispatch(showInvitedUsers(inviteState.roomId));
    }
  }, [inviteState.isModalOpen]);

  return (
    <>
      <MuiThemeProvider theme={theme}>
        <Dialog
          title="Invite people to room"
          open={inviteState.roomId === roomId && inviteState.isModalOpen}
          fullWidth={true}
          maxWidth="sm"
          PaperProps={{
            style: {
              backgroundColor: "#36393f",
              borderRadius: "0.875rem"
            }
          }}
        >
          {inviteState.isSuccess && <StyledNotification title="Something went wrong" icon="error" />}
          <DialogTitle>Send invitation</DialogTitle>
          <DialogContent>
            <Autocomplete
              multiple
              options={_.differenceWith(allUsersInfo, inviteState.usersInRoom, (a, b) => a.id === b.id)}
              getOptionLabel={(option) => `${option.realName} (${option.userName})`}
              filterOptions={(options, state) => {
                return options.filter((option) => {
                  const regex = new RegExp(state.inputValue, "i");
                  return regex.test(option.realName) || regex.test(option.userName) || regex.test(option.email);
                });
              }}
              renderOption={(option) => {
                return (
                  <StyledTimelineMarker
                    label={`${option.realName} (${option.userName})`}
                    description={`${option.email}`}
                    icon={<StyledAvatar src={`${hostName}/${option.avatar}`} alt="avatar" />}
                  />
                );
              }}
              filterSelectedOptions
              renderInput={(params) => <TextField {...params} variant="outlined" label="Send invitation to" />}
              onChange={(_, values) => setEmailList(values.map((value: User) => value.email))}
              getOptionSelected={(option, value) => option.id === value.id}
            />
            <br />
            <InvitedUserListContainer>
              {inviteState.usersInRoom.map((user) => (
                <div key={user.id}>
                  <InvitedUserCardComponent
                    userId={user.id}
                    icon={<StyledUserAvatar src={`${hostName}/${user.avatar}`} />}
                    title={`${user.realName} (${user.userName})`}
                    email={user.email}
                    creatorId={getLoginData().id}
                    roomId={roomId}
                  />
                </div>
              ))}
            </InvitedUserListContainer>
            <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
          </DialogContent>
          <DialogActions style={{ paddingRight: "24px", paddingBottom: "16px" }}>
            <Button
              onClick={() => dispatch(setInviteModalOpen({ roomId, isModalOpen: false }))}
              label="Cancel"
              variant="neutral"
              disabled={inviteState.isLoading || inviteState.isSuccess}
            />
            <Button
              label="Send"
              variant="brand"
              onClick={onSendInvite}
              disabled={inviteState.isLoading || inviteState.isSuccess}
            />
          </DialogActions>
        </Dialog>
      </MuiThemeProvider>

      <Modal
        title="Confirm Kick"
        isOpen={invitedUserCardState.roomId === roomId && invitedUserCardState.isKickConfirmModalOpen}
        hideCloseButton={true}
        onRequestClose={() => dispatch(setKickModalOpen({ roomId: null, userId: null, isKickConfirmModalOpen: false }))}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
              label="Cancel"
              variant="neutral"
              onClick={() => dispatch(setKickModalOpen({ roomId: null, userId: null, isKickConfirmModalOpen: false }))}
              disabled={invitedUserCardState.isLoading || invitedUserCardState.isSuccess}
            />
            <Button
              label="Kick"
              variant="brand"
              type="submit"
              onClick={() => dispatch(kickInvitedUser(roomId, invitedUserCardState.userId))}
              disabled={invitedUserCardState.isLoading || invitedUserCardState.isSuccess}
            />
          </div>
        }
      >
        {invitedUserCardState.error && (
          <Notification
            title="An Error Occurred"
            icon="error"
            hideCloseButton={true}
            description={invitedUserCardState.error.message}
          />
        )}
        {invitedUserCardState.isSuccess && (
          <Notification title="Kicked User Successfully" icon="success" hideCloseButton={true} />
        )}
        <StyledText>Are you sure you want to kick this member out of the room?</StyledText>
      </Modal>
    </>
  );
};

export default InviteForm;

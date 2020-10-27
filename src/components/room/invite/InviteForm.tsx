import React, { useEffect, useState } from "react";
import { Button, Textarea, TimelineMarker } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { StyledNotification } from "../../account-management/styles";
import { setInviteModalOpen, startInvite } from "./inviteSlice";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { AllUsersInfo, User } from "~utils/types";
import { TextField, Dialog, createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { hostName } from "~utils/hostUtils";
import styled from "styled-components";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#4ecca3",
      contrastText: "#36393f"
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

const InviteForm = (props: any) => {
  const inviteState = useSelector((root: RootState) => root.inviteState);
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
  }, [inviteState.isModalOpen]);

  const allUsersInfo = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];

  return (
    <MuiThemeProvider theme={theme}>
      <Dialog
        title="Invite people to room"
        open={inviteState.roomId === roomId && inviteState.isModalOpen}
        fullWidth={true}
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: "#36393f"
          }
        }}
      >
        {inviteState.isSuccess && <StyledNotification title="Something went wrong" icon="error" />}
        <DialogTitle>Send invitation</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={allUsersInfo}
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
  );
};

export default InviteForm;

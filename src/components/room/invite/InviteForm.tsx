import React, { useEffect, useState } from "react";
import { Button, Modal, Textarea } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { setInviteModalOpen, startInvite } from "./inviteSlice";
import { StyledNotification } from "../../account-management/styles";

const InviteForm = (props: any) => {
  const inviteState = useSelector((root: RootState) => root.inviteState);
  const dispatch = useDispatch();
  const { roomId } = props;
  const [emailList, setEmailList] = useState("");
  const [message, setMessage] = useState("");

  function onSendInvite() {
    if (emailList?.trim()) {
      dispatch(startInvite(inviteState.roomId, emailList.trim().split("\n"), message));
    }
  }

  useEffect(() => {
    dispatch(setInviteModalOpen({ roomId, isModalOpen: false }));
  }, [dispatch, inviteState.isSuccess, roomId]);
  useEffect(() => {
    setEmailList("");
    setMessage("");
  }, [inviteState.isModalOpen]);
  return (
    <div>
      <Modal
        title="Invite people to room"
        hideCloseButton={true}
        isOpen={inviteState.roomId === roomId && inviteState.isModalOpen}
        footer={
          <div className="rainbow-flex rainbow-justify_end">
            <Button
              className="rainbow-m-right_large"
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
          </div>
        }
      >
        {inviteState.isSuccess && <StyledNotification title="Something went wrong" icon="error" />}
        <Textarea placeholder="Email list" value={emailList} onChange={(e) => setEmailList(e.target.value)} />
        <br />
        <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
      </Modal>
    </div>
  );
};

export default InviteForm;

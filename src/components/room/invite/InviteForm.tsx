import React, { useEffect, useRef, useState } from "react";
import { Button, Textarea, Modal } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { setInviteModalOpen, startInvite } from "./inviteSlice";
import { StyledNotification } from "../../account-management/login/styles";

const InviteForm = (props: any) => {
  const inviteState = useSelector((root: RootState) => root.inviteState);
  const dispatch = useDispatch();
  const { roomId } = props;
  const inviteList = useRef<HTMLTextAreaElement>();
  const message = useRef<HTMLTextAreaElement>();

  function onSendInvite() {
    if (inviteList.current.value?.trim()) {
      dispatch(startInvite(inviteState.roomId, inviteList.current.value.trim().split("\n"), message.current.value));
    }
  }

  useEffect(() => {
    dispatch(setInviteModalOpen({ roomId, isModalOpen: false }));
  }, [inviteState.isSuccess]);

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
        <textarea placeholder="Email list" ref={inviteList} />
        <br />
        <textarea placeholder="Message" ref={message} />
      </Modal>
    </div>
  );
};

export default InviteForm;

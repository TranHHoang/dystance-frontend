import React, { useEffect, useRef, useState } from "react";
import { Button, Textarea, Modal } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { startInvite } from "./inviteSlice";

const InviteForm = () => {
  const inviteState = useSelector((root: RootState) => root.inviteState);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  const inviteList = useRef<HTMLTextAreaElement>();
  const message = useRef<HTMLInputElement>();

  function onSendInvite() {
    if (inviteList.current.textContent?.trim()) {
      dispatch(startInvite("1", inviteList.current.textContent.trim().split("\n"), message.current.textContent));
    }
  }

  useEffect(() => {
    setShowModal(inviteState.isSuccess ?? false);
  }, [inviteState.isSuccess]);

  return (
    <Modal
      title="Invite people to room"
      hideCloseButton={true}
      isOpen={showModal}
      footer={
        <div className="rainbow-flex rainbow-justify_end">
          <Button className="rainbow-m-right_large" label="Cancel" variant="neutral" disabled={inviteState.isLoading} />
          <Button label="Send" variant="brand" onClick={onSendInvite} disabled={inviteState.isLoading} />
        </div>
      }
    >
      {inviteState.isSuccess && <div>Something went wrong</div>}
      <Textarea placeholder="Email list" ref={inviteList} />
      <br />
      <Textarea placeholder="Message" ref={message} />
    </Modal>
  );
};

export default InviteForm;

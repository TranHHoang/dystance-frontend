import { faArrowLeft, faPaperclip, faPaperPlane, faPencilAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import ChatArea from "../chat/ChatArea";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ButtonIcon, TimelineMarker, Textarea, Button, Modal, Lookup } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { broadcastMessage, ChatType, fetchAllMessages } from "../../components/chat/chatSlice";
import { fetchAllPreview } from "./chatPreviewSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";
import { LookupValue } from "react-rainbow-components/components/types";
import _ from "lodash";
import { getLoginData, getAllUsers, hostName, getUser, getCurrentRole } from "~utils/index";

declare module "react-rainbow-components/components/types" {
  interface LookupValue {
    id: string;
  }
}

const StyledAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const StyledPreview = styled.div`
  padding: 20px 20px;
  transition: 0.2s;
  :hover {
    background-color: lightgray;
    /* filter: brightness(80%); */
    cursor: pointer;
  }
`;

const StyledHeader = styled.header`
  background-color: ${(props) => props.theme.rainbow.palette.background.main};
  z-index: 1;
  display: flex;
  padding: 5 0 5 0;
  span {
    align-self: center;
    font-size: 16px;
    /* color: white; */
  }
`;

const StyledButtonIcon = styled(ButtonIcon)`
  position: absolute;
  bottom: 40px;
  right: 40px;
  padding: 30px;
`;

const Container = styled.div`
  width: 100%;
  height: calc(98vh - 40px);
`;
const Title = styled.h1`
  font-size: 2.5em;
  font-weight: 600;
  /* color: white; */
  padding-right: 20px;
`;
interface NewChatFormValues {
  id: string;
  message: string;
}

const initialValues: NewChatFormValues = {
  id: "",
  message: ""
};

const schema = Yup.object({
  id: Yup.string().required("This field is required"),
  message: Yup.string().required("This field is required")
});

const ChatPreview = (props: any) => {
  const { inRoom } = props;
  const previews = useSelector((root: RootState) => root.chatPreviewState.chatPreview);
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState<LookupValue>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllPreview(getLoginData().id));
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      dispatch(fetchAllMessages(undefined, { id1: selectedUserId, id2: getLoginData().id }));
    }
  }, [selectedUserId]);

  function onNewChatSubmit(values: NewChatFormValues) {
    if (selectedUser) {
      dispatch(broadcastMessage(undefined, values.id, values.message));
      setShowNewMessageModal(false);
      setSelectedUserId(values.id);
    }
  }

  const options: LookupValue[] = getAllUsers()
    .filter((userInfo) => userInfo.role === (getCurrentRole() === "teacher" ? "student" : "teacher"))
    .map((userInfo) => ({
      id: userInfo.id,
      label: `${userInfo.realName} (${userInfo.userName})`,
      description: `${userInfo.email}`,
      // eslint-disable-next-line jsx-a11y/alt-text
      icon: (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          style={{ height: "32px", width: "32px", borderRadius: "50%", objectFit: "cover" }}
          src={`${hostName}/${userInfo.avatar}`}
        />
      )
    }));

  function filter(query: string, options: LookupValue[]) {
    if (query) {
      return options.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.label.toString()) && item.id !== getLoginData().id;
      });
    }
    return [];
  }

  return (
    <Container style={{ height: inRoom ? "calc(98vh - 40px - 72.19px)" : "calc(98vh - 40px)" }}>
      {!selectedUserId ? (
        <>
          {!inRoom ? (
            <div style={{ padding: "20px 0 20px 20px" }}>
              <Title>Private Messages</Title>
            </div>
          ) : null}
          {_.orderBy(previews, ["date"], ["desc"]).map((preview) => {
            const id = preview.senderId !== getLoginData().id ? preview.senderId : preview.receiverId;
            return (
              <StyledPreview key={preview.id} onClick={() => setSelectedUserId(id)}>
                <TimelineMarker
                  label={
                    <b>
                      {getUser(id)?.realName} ({getUser(id)?.userName})
                    </b>
                  }
                  icon={
                    <StyledAvatar src={getUser(id)?.avatar ? `${hostName}/${getUser(id)?.avatar}` : ""} alt="avatar" />
                  }
                  datetime={moment.utc(preview.date).local().calendar()}
                  description={
                    <>
                      <span>{preview.senderId === getLoginData().id && "You: "}</span>
                      {(preview.type === ChatType.File || preview.type === ChatType.Image) && (
                        <span>
                          <FontAwesomeIcon icon={faPaperclip} />
                          &nbsp;
                          {preview.fileName}
                        </span>
                      )}
                      {preview.type === ChatType.Text && <span> {preview.content} </span>}
                    </>
                  }
                />
              </StyledPreview>
            );
          })}

          <Modal isOpen={showNewMessageModal} title="New message" onRequestClose={() => setShowNewMessageModal(false)}>
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onNewChatSubmit}>
              {({ errors, touched, setFieldValue }: FormikProps<NewChatFormValues>) => (
                <Form>
                  <Lookup
                    name="id"
                    placeholder="Who do you want to talk to?"
                    debounce
                    value={selectedUser}
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    options={autoCompleteOptions}
                    onSearch={(value) => setAutoCompleteOptions(filter(value, options))}
                    onChange={(option) => {
                      setFieldValue("id", option?.id ?? "");
                      setSelectedUser(option);
                    }}
                    size="small"
                    error={errors.id && touched.id && errors.id}
                  />

                  <br />
                  <Field
                    name="message"
                    as={Textarea}
                    type="text"
                    placeholder="What do you want to talk about?"
                    errors={errors.message && touched.message && errors.message}
                  />
                  <br />
                  <div className="rainbow-flex rainbow-justify_end">
                    <Button variant="brand" type="submit">
                      Send&nbsp;
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Modal>

          <StyledButtonIcon
            assistiveText="New message"
            title="New message"
            variant="brand"
            icon={<FontAwesomeIcon icon={faPencilAlt} />}
            size="large"
            onClick={() => setShowNewMessageModal(true)}
          />
        </>
      ) : (
        <>
          <StyledHeader>
            <ButtonIcon
              icon={<FontAwesomeIcon icon={faArrowLeft} />}
              onClick={() => setSelectedUserId(undefined)}
              size="medium"
            />
            <span>
              <b>
                {getUser(selectedUserId)?.realName} ({getUser(selectedUserId)?.userName})
              </b>
            </span>
          </StyledHeader>
          <div style={{ margin: "0 5 0 5" }}>
            <ChatArea receiverId={selectedUserId} inRoom={inRoom} />
          </div>
        </>
      )}
    </Container>
  );
};

export default ChatPreview;

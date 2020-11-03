import { faArrowLeft, faPaperclip, faPaperPlane, faPencilAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import ChatArea from "../chat/ChatArea";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ButtonIcon, TimelineMarker, Input, Textarea, Button, Modal, Lookup } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { hostName } from "~utils/hostUtils";
import { AllUsersInfo, getUserInfo, PrivateMessage, User, UserInfo } from "~utils/types";
import { broadcastMessage, ChatType, fetchAllMessages } from "../../components/chat/chatSlice";
import { fetchAllPreview } from "./chatPreviewSlice";
import { getLoginData } from "~utils/tokenStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { socket } from "~app/App";
import * as Yup from "yup";
import { Field, Form, Formik, FormikProps } from "formik";
import { LookupValue } from "react-rainbow-components/components/types";

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
  :hover {
    background-color: rgba(255, 255, 255, 0.05);
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
    color: white;
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
  font-weight: 500;
  color: white;
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
  const { inRoom, inSidebar } = props;
  const [usersInfo, setUsersInfo] = useState<{ [key: string]: UserInfo }>({});
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
    const fetchUsersInfo = async () => {
      const userDict: { [key: string]: UserInfo } = {};
      const usersInfoPromise = previews.map(async (chat) => {
        if (chat.senderId !== getLoginData().id) {
          const info = await getUserInfo(chat.senderId);
          userDict[chat.senderId] = info; // { 1: { avatar: "", }}
        } else {
          const info = await getUserInfo(chat.receiverId);
          userDict[chat.receiverId] = info; // { 1: { avatar: "", }}
        }
      });
      await Promise.all(usersInfoPromise);
      setUsersInfo(userDict);
    };
    fetchUsersInfo();
  }, [previews]);

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

  const allUsersInfo = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const options: LookupValue[] = allUsersInfo.map((userInfo) => ({
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
        return regex.test(item.label) && item.id !== getLoginData().id;
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
          {previews.map((preview) => {
            const id = preview.senderId !== getLoginData().id ? preview.senderId : preview.receiverId;
            return (
              <StyledPreview key={preview.id} onClick={() => setSelectedUserId(id)}>
                <TimelineMarker
                  label={
                    <b>
                      {usersInfo[id]?.realName} ({usersInfo[id]?.userName})
                    </b>
                  }
                  icon={
                    <StyledAvatar
                      src={usersInfo[id]?.avatar ? `${hostName}/${usersInfo[id]?.avatar}` : ""}
                      alt="avatar"
                    />
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
                    placeholder="To someone you ❤️"
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
            onClick={(e) => setShowNewMessageModal(true)}
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
                {usersInfo[selectedUserId]?.realName} ({usersInfo[selectedUserId]?.userName})
              </b>
            </span>
          </StyledHeader>
          <div style={{ margin: "0 5 0 5" }}>
            <ChatArea receiverId={selectedUserId} />
          </div>
        </>
      )}
    </Container>
  );
};

export default ChatPreview;

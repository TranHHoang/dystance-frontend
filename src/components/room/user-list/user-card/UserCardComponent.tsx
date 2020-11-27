import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setPeopleProfileModalOpen } from "../../../profile-page/people-profile/peopleProfileSlice";
import * as React from "react";
import { Card, ButtonMenu, MenuItem } from "react-rainbow-components";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { getLoginData } from "~utils/tokenStorage";
import {
  setKickModalOpen,
  setMuteModalOpen,
  setRemoteControlWaitingModalOpen,
  toggleWhiteboardUsage
} from "./userCardSlice";
import { Logger, LogType } from "~utils/logger";
import { setUserId } from "../../../../components/room/remote-control/remoteControlSlice";
import { allUsers } from "~utils/types";
import _ from "lodash";

const StyledCard = styled(Card)`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
`;

const UserCardComponent = (props: any) => {
  const { userId, icon, title, creatorId, roomId } = props;
  const user = _.find(allUsers, { id: userId });
  const dispatch = useDispatch();
  const logger = Logger.getInstance();
  return (
    <div>
      <StyledCard
        icon={icon}
        title={title}
        actions={
          userId !== getLoginData().id ? (
            <ButtonMenu menuAlignment="right" menuSize="x-small" icon={<FontAwesomeIcon icon={faEllipsisV} />}>
              <MenuItem
                label="View Profile"
                onClick={() => dispatch(setPeopleProfileModalOpen({ userId, peopleProfileModalOpen: true }))}
              />
              {getLoginData().id === creatorId ? (
                <div>
                  <MenuItem
                    label="Kick User Out"
                    onClick={() => dispatch(setKickModalOpen({ userId, isKickModalOpen: true }))}
                  />
                  <MenuItem
                    label="Mute"
                    onClick={() => dispatch(setMuteModalOpen({ userId, isMuteModalOpen: true }))}
                  />
                  <MenuItem
                    label="Remote control"
                    onClick={() => {
                      dispatch(setRemoteControlWaitingModalOpen({ userId, isModalOpen: true }));
                      logger.log(LogType.RemoteControlPermission, roomId, `Asked to remote control ${user.realName}`);
                      dispatch(setUserId(userId));
                    }}
                  />
                  <MenuItem
                    label="Toggle Whiteboard Usage"
                    onClick={() => {
                      dispatch(toggleWhiteboardUsage(roomId, userId));
                      logger.log(LogType.ToggleWhiteboard, roomId, `Toggled whiteboard usage for ${user.realName}`);
                    }}
                  />
                </div>
              ) : null}
            </ButtonMenu>
          ) : null
        }
      />
    </div>
  );
};
export default UserCardComponent;

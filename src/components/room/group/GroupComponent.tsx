import React, { useEffect, useRef, useState } from "react";
import {
  Picklist,
  Option,
  Accordion,
  AccordionSection,
  Button,
  MultiSelect,
  Input,
  Badge
} from "react-rainbow-components";
import _ from "lodash";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import {
  createGroups,
  deleteGroups,
  fetchAllGroups,
  resetGroups,
  setGroupId,
  setGroupJoined,
  setMainRoomId,
  startNewSession,
  updateGroups
} from "./groupSlice";
import { withRouter } from "react-router-dom";
import { switchToGroup } from "../room-component/roomSlice";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { Logger, LogType, User, getLoginData, getUser, hostName, get } from "~utils/index";

declare module "~utils/interfaces" {
  interface User {
    selected: boolean;
  }
}

const StyledAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

interface UsersByGroup {
  [groupId: number]: { id: string; name: string }[];
}

const ButtonDiv = styled.div`
  display: flex;
  justify-content: center;
`;

const GroupComponent = (props: any) => {
  const { roomId, roomName, teacherId } = props;
  const [picklistValue, setPicklistValue] = useState(0);
  const [usersByGroup, setUsersByGroup] = useState<UsersByGroup>({});
  const breakoutGroups = useSelector((root: RootState) => root.groupState.breakoutGroup);
  const [usersInRoom, setUsersInRoom] = useState<User[]>();
  const keyToRoomNameDict = useRef<{ [key: number]: string }>({});
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [status, setStatus] = useState("Not started");
  const [timeout, setTimeout] = useState(10);
  const intervalRef = useRef<number>();
  const [hidden, setHidden] = useState(false);
  const logger = Logger.getInstance();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllGroups(roomId));
    get(`/rooms/getUsers?id=${roomId}`).then(({ data: userIds }) => {
      setUsersInRoom(
        _(userIds)
          .reject((id) => id === getLoginData().id)
          .map((id) => getUser(id))
          .value()
      );
    });
    setHidden(getLoginData().id !== teacherId);
  }, []);

  useEffect(() => {
    const users = (usersInRoom || []).map((user) => ({ ...user }));

    const usersDict = _(breakoutGroups)
      .sortBy([(group) => group.groupId])
      .reduce((result, value, key) => {
        key += 1;
        keyToRoomNameDict.current[key] = value.groupId;
        _.each(users, (user) => {
          user.selected = _(breakoutGroups)
            .flatMap((group) => group.userIds)
            .some((id) => id === user.id);
        });

        result[key] =
          // usersByGroup[key] ||
          _.map(value.userIds, (value) => {
            const user = getUser(value);

            return {
              id: value,
              name: `${user.realName} (${user.userName})`
            };
          });

        return result;
      }, {} as UsersByGroup);

    // If no room was found, release all users
    if (breakoutGroups.length === 0) {
      _.each(users, (user) => {
        user.selected = false;
      });
    }

    setUsersInRoom(users);

    setUsersByGroup(usersDict);
    setPicklistValue(Object.values(usersDict).length);
    const [group] = breakoutGroups;

    clearInterval(intervalRef.current);
    setStatus("Not started");
    if (group && group.startTime && group.endTime && group.startTime !== group.endTime) {
      let duration = moment(group.endTime).diff(moment());

      intervalRef.current = setInterval(() => {
        duration = duration - 1000;
        setStatus(moment(duration).format("mm:ss"));

        if (duration <= 0) {
          clearInterval(intervalRef.current);
          setStatus("Not started");
          if (getLoginData().id === teacherId) {
            dispatch(
              resetGroups(
                roomId,
                _.map(breakoutGroups, (group) => group.groupId)
              )
            );
          }
        }
      }, 1000);
    }
  }, [breakoutGroups]);

  function saveChanges() {
    // Check if room is added/removed
    if (picklistValue > breakoutGroups.length) {
      // The existing room always occupies from the first slot
      dispatch(
        createGroups(
          roomId,
          teacherId,
          _.range(breakoutGroups.length + 1, picklistValue + 1).map((value) => ({
            name: `Group #${value}`,
            userIds: _.map(usersByGroup[value], "id") || []
          }))
        )
      );
      logger.log(LogType.GroupCreate, roomId, `Created ${picklistValue - breakoutGroups.length} groups`);
    } else if (picklistValue < breakoutGroups.length) {
      // Delete existing, always delete from end to start
      // Because the deleted groups are existing, they are guaranteed to have key in `keyToRoomNameDict`
      dispatch(
        deleteGroups(
          roomId,
          _.range(picklistValue + 1, breakoutGroups.length + 1).map((key) => keyToRoomNameDict.current[key])
        )
      );
      logger.log(LogType.GroupDelete, roomId, `Deleted ${breakoutGroups.length - picklistValue} groups`);
    }

    const usersByGroupList = _(usersByGroup)
      .mapValues((value, key) => ({
        groupId: keyToRoomNameDict.current[parseInt(key)],
        userIds: _.map(value, (value) => value.id)
      }))
      .values()
      .filter(({ groupId }) => groupId !== undefined)
      .value();

    // Update userIds in all groups
    if (usersByGroupList) {
      dispatch(updateGroups(roomId, usersByGroupList));
    }

    setSaveDisabled(true);
  }

  function joinGroup(groupId: number) {
    const groupName = btoa(`${roomName} - Group #${groupId}`);
    dispatch(
      switchToGroup({
        id: keyToRoomNameDict.current[groupId],
        roomPath: `/room/${roomId}/${teacherId}/${roomName}`,
        name: groupName,
        endTime: _.find(breakoutGroups, { groupId: keyToRoomNameDict.current[groupId] }).endTime
      })
    );
    dispatch(setGroupId(groupId.toString()));
    dispatch(setGroupJoined(true));
    dispatch(setMainRoomId(roomId));
    logger.log(LogType.GroupJoin, roomId, `Joined group ${groupId.toString()}`);
  }

  function handleSession() {
    if (timeout > 0 && timeout <= 60) {
      dispatch(
        startNewSession(
          roomId,
          status === "Not started" ? timeout : 0,
          _.map(breakoutGroups, (group) => group.groupId)
        )
      );
      if (status === "Not started") {
        logger.log(LogType.GroupStart, roomId, "Started groups");
      } else {
        logger.log(LogType.GroupStop, roomId, "Stopped groups");
      }
    }
  }

  return (
    <div>
      {!hidden && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 8 }}>
          <Picklist
            value={{ label: picklistValue.toString() }}
            onChange={(value) => {
              setPicklistValue(parseInt(value.label));
              setSaveDisabled(false);
            }}
            style={{ display: "inline-block", width: 115, textAlign: "center" }}
            label="Groups"
          >
            {_.range(9).map((index) => (
              <Option key={index} name={index} label={index.toString()} />
            ))}
          </Picklist>
          <Input
            style={{ display: "inline-block", marginLeft: 8, width: 150 }}
            type="number"
            label="Timeout (minutes)"
            labelAlignment="left"
            value={timeout}
            min="1"
            max="60"
            onChange={(e) => setTimeout(parseInt(e.target.value))}
            error={(timeout < 1 || timeout > 60) && "Invalid timeout"}
          />
          <Button
            variant="outline-brand"
            style={{ marginLeft: 8, marginTop: 23 }}
            onClick={handleSession}
            disabled={!saveDisabled || picklistValue === 0}
            label={status === "Not started" ? "Start" : "Stop"}
          />
        </div>
      )}

      <Accordion multiple>
        {_.range(1, picklistValue + 1).map((groupId) => (
          <AccordionSection
            key={groupId}
            label={
              <div>
                <Badge style={{ marginRight: 16 }} variant={status === "Not started" ? "default" : "brand"}>
                  <span style={{}}>{status}</span>
                </Badge>
                <b> Group #{groupId} </b>
                &nbsp;
                <Badge variant="inverse" style={{ marginRight: 16 }}>
                  {`${usersByGroup[groupId]?.length ?? 0}`} people
                </Badge>
                <Button
                  variant="neutral"
                  onClick={() => joinGroup(groupId)}
                  disabled={
                    status === "Not started" ||
                    (getLoginData().id !== teacherId &&
                      !usersByGroup[groupId]?.some((user) => user.id === getLoginData().id))
                  }
                >
                  Join now&nbsp;
                  <FontAwesomeIcon icon={faSignInAlt} />
                </Button>
              </div>
            }
          >
            <MultiSelect
              placeholder={`Add people to Group #${groupId}`}
              value={usersByGroup[groupId]?.map((value) => ({ name: value.id, label: value.name }))}
              onChange={(values) => {
                setSaveDisabled(false);

                const otherGroupsSelectedUserIds = _(usersByGroup)
                  .filter((_, key) => key !== groupId.toString())
                  .flatMap((users) => users.map((user) => user.id))
                  .value();

                setUsersInRoom(
                  _.map(usersInRoom, (user) => ({
                    ...user,
                    selected:
                      _.some(otherGroupsSelectedUserIds, (id) => id === user.id) || _.some(values, { name: user.id })
                  }))
                );

                setUsersByGroup({
                  ...usersByGroup,
                  [groupId]: _.map(values, (value) => ({
                    id: value.name.toString(),
                    name: value.label
                  }))
                });
              }}
              onBlur={(e) => e.stopPropagation()}
              style={{ maxHeight: 50 }}
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              showCheckbox
              readOnly={hidden}
            >
              {_.filter(usersInRoom, (user) => !!!user.selected || _.some(usersByGroup[groupId], { id: user.id })).map(
                (value) => (
                  <Option
                    key={value.id}
                    name={value.id}
                    label={`${value.realName} (${value.userName})`}
                    icon={<StyledAvatar src={`${hostName}/${value.avatar}`} />}
                  />
                )
              )}
            </MultiSelect>
          </AccordionSection>
        ))}
      </Accordion>

      <br />
      {!hidden && (
        <ButtonDiv>
          <Button style={{ width: 100 }} variant="brand" label="Save" onClick={saveChanges} disabled={saveDisabled} />
        </ButtonDiv>
      )}
    </div>
  );
};

export default withRouter(GroupComponent);

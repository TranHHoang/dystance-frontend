import React, { useEffect, useRef, useState } from "react";
import { Picklist, Option, Accordion, AccordionSection, Button, MultiSelect, Input } from "react-rainbow-components";
import _ from "lodash";
import { AllUsersInfo, User } from "~utils/types";
import { hostName } from "~utils/hostUtils";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { createGroups, deleteGroups, fetchAllGroups, startNewSession, updateGroups } from "./groupSlice";
import { withRouter } from "react-router-dom";
import { switchToGroup } from "../room-component/roomSlice";
import { get } from "~utils/axiosUtils";
import { getLoginData } from "~utils/tokenStorage";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";

declare module "~utils/types" {
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
  const { roomId, roomName, creatorId } = props;
  const [picklistValue, setPicklistValue] = useState(0);
  const [usersByGroup, setUsersByGroup] = useState<UsersByGroup>({});
  const groupState = useSelector((root: RootState) => root.groupState);
  const allUsers = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const [usersInRoom, setUsersInRoom] = useState<User[]>();
  const keyToRoomNameDict = useRef<{ [key: number]: string }>({});
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [status, setStatus] = useState("Not started");
  const [timeout, setTimeout] = useState(10);
  const intervalRef = useRef<number>();
  const [hidden, setHidden] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllGroups(roomId));
    get(`/rooms/getUsers?id=${roomId}`).then(({ data: userIds }) => {
      console.log(userIds);
      setUsersInRoom(_.map(userIds, (id) => _.find(allUsers, { id })));
    });
    setHidden(getLoginData().id !== creatorId);
  }, []);

  useEffect(() => {
    const usersDict = _(groupState)
      .sortBy([(group) => group.groupId])
      .reduce((result, value, key) => {
        key += 1;
        keyToRoomNameDict.current[key] = value.groupId;
        _.each(usersInRoom, (user) => {
          user.selected = user.selected || _.some(value.userIds, (id) => user.id === id);
        });

        result[key] =
          usersByGroup[key] ||
          _.map(value.userIds, (value) => {
            const user = _.find(allUsers, { id: value });

            return {
              id: value,
              name: `${user.realName} (${user.userName})`
            };
          });

        return result;
      }, {} as UsersByGroup);

    setUsersByGroup(usersDict);
    setPicklistValue(Object.values(usersDict).length);

    const [group] = groupState;
    clearInterval(intervalRef.current);
    if (group && group.startTime && group.endTime && group.startTime !== group.endTime) {
      let duration = moment(group.endTime).diff(moment());

      intervalRef.current = setInterval(() => {
        duration = duration - 1000;
        setStatus(moment(duration).format("mm:ss"));

        if (duration <= 0) {
          clearInterval(intervalRef.current);
          setStatus("Not started");
        }
      }, 1000);
    }
  }, [groupState]);

  function saveChanges() {
    // Check if room is add/remove
    if (picklistValue > groupState.length) {
      // The existing room always occupies from the first slot
      dispatch(
        createGroups(
          roomId,
          creatorId,
          _.range(groupState.length + 1, picklistValue + 1).map((value) => ({
            name: `Group #${value}`,
            userIds: _.map(usersByGroup[value], "id") || []
          }))
        )
      );
    } else if (picklistValue < groupState.length) {
      // Delete existing, always delete from end to start
      // Because the deleted groups are existing, they are guaranteed to have key in `keyToRoomNameDict`
      dispatch(
        deleteGroups(_.range(picklistValue + 1, groupState.length + 1).map((key) => keyToRoomNameDict.current[key]))
      );
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
    dispatch(updateGroups(usersByGroupList));
  }

  function joinGroup(groupId: number) {
    console.log(groupId);
    const groupName = btoa(`${roomName} - Group #${groupId}`);
    dispatch(
      switchToGroup({
        id: keyToRoomNameDict.current[groupId],
        roomPath: `/room/${roomId}/${creatorId}/${roomName}`,
        name: groupName,
        endTime: _.find(groupState, { groupId: groupId.toString() }).endTime
      })
    );
  }

  function startSession() {
    dispatch(startNewSession(roomId, timeout));
  }

  return (
    <div>
      {!hidden && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
          <Picklist
            value={{ label: picklistValue.toString() }}
            onChange={(value) => {
              setPicklistValue(parseInt(value.label));
              setSaveDisabled(false);
            }}
            style={{ display: "inline-block", width: 115, textAlign: "center" }}
            label="Groups"
            // disabled={getLoginData().id !== creatorId}
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
            onChange={(e) => setTimeout(parseInt(e.target.value))}
          />
          <Button
            variant="outline-brand"
            style={{ marginLeft: 8, marginTop: 23 }}
            onClick={startSession}
            disabled={status !== "Not started"}
          >
            {status === "Not started" ? "Start" : status}
          </Button>
        </div>
      )}

      <Accordion multiple>
        {_.range(1, picklistValue + 1).map((groupId) => (
          <AccordionSection
            key={groupId}
            label={
              <div>
                <b style={{ marginRight: 16 }}>Group #{groupId}</b>
                <i style={{ marginRight: 16 }}>{`${usersByGroup[groupId]?.length ?? 0} people in room`}</i>
                <Button
                  label="Join"
                  variant="neutral"
                  onClick={() => joinGroup(groupId)}
                  disabled={
                    status === "Not started" ||
                    (getLoginData().id !== creatorId &&
                      !usersByGroup[groupId]?.some((user) => user.id === getLoginData().id))
                  }
                >
                  Join&nbsp;
                  <FontAwesomeIcon icon={faSignInAlt} />
                </Button>
                <span style={{ marginLeft: 16, fontStyle: "italic" }}>{status}</span>
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

                _.each(usersInRoom, (user) => {
                  user.selected =
                    _.some(otherGroupsSelectedUserIds, (id) => id === user.id) || _.some(values, { name: user.id });
                });

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
              disabled={hidden}
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

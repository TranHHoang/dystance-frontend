import React, { useEffect, useRef, useState } from "react";
import { Picklist, Option, Accordion, AccordionSection, Button, MultiSelect } from "react-rainbow-components";
import _ from "lodash";
import { AllUsersInfo, User } from "~utils/types";
import { hostName } from "~utils/hostUtils";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "~app/rootReducer";
import { createGroups, deleteGroups, fetchAllGroups, updateGroups } from "./groupSlice";

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
  const { roomId, creatorId } = props;
  const [picklistValue, setPicklistValue] = useState(0);
  const [usersByGroup, setUsersByGroup] = useState<UsersByGroup>({});
  const groupState = useSelector((root: RootState) => root.groupState);
  const users = JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[];
  const usersInGroup = useRef(
    users
    // _.filter(_.intersectionBy(JSON.parse(sessionStorage.getItem(AllUsersInfo)) as User[], userListState, "id"))
  );
  const keyToRoomNameDict = useRef<{ [key: number]: string }>({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllGroups(roomId));
  }, []);

  useEffect(() => {
    const usersDict = _(groupState)
      .sortBy([(group) => group.groupId])
      .reduce((result, value, key) => {
        key += 1;
        keyToRoomNameDict.current[key] = value.groupId;

        result[key] =
          usersByGroup[key] ||
          _.map(value.userIds, (value) => {
            const user = _.find(users, { id: value });

            return {
              id: value,
              name: `${user.realName} (${user.userName})`
            };
          });

        return result;
      }, {} as UsersByGroup);

    setUsersByGroup(usersDict);
    setPicklistValue(Object.values(usersDict).length);
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
      .value()
      .filter(({ groupId }) => groupId !== undefined);

    // Update userIds in all groups
    dispatch(updateGroups(usersByGroupList));
  }

  function joinGroup(groupId: number) {
    return;
  }

  return (
    <div>
      <h1 style={{ fontSize: 16, color: "white" }}>Select the number of groups</h1>
      <br />
      <Picklist
        value={{ label: picklistValue.toString() }}
        onChange={(value) => setPicklistValue(parseInt(value.label))}
      >
        <Option label="0" />
        {_.range(2, 9).map((index) => (
          <Option key={index} name={index} label={index.toString()} />
        ))}
      </Picklist>

      <Accordion>
        {_.range(1, picklistValue + 1).map((groupId) => (
          <AccordionSection
            key={groupId}
            label={
              <div>
                <b style={{ marginRight: 16 }}>Group #{groupId}</b>
                <i style={{ marginRight: 16 }}>{`${usersByGroup[groupId]?.length ?? 0} people in room`}</i>
                <Button label="Join" variant="neutral" onClick={() => joinGroup(groupId)} />
              </div>
            }
          >
            <MultiSelect
              placeholder={`Add people to Group #${groupId}`}
              value={usersByGroup[groupId]?.map((value) => ({ name: value.id, label: value.name }))}
              onChange={(values) => {
                _.each(usersInGroup.current, (user) => {
                  user.selected = _.some(values, { name: user.id });
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
              showCheckbox
            >
              {_.filter(
                usersInGroup.current,
                (user) => !!!user.selected || _.some(usersByGroup[groupId], { id: user.id })
              ).map((value) => (
                <Option
                  key={value.id}
                  name={value.id}
                  label={`${value.realName} (${value.userName})`}
                  icon={<StyledAvatar src={`${hostName}/${value.avatar}`} />}
                />
              ))}
            </MultiSelect>
          </AccordionSection>
        ))}
      </Accordion>

      <br />
      <ButtonDiv>
        <Button style={{ width: 100 }} variant="brand" label="Save" onClick={saveChanges} />
      </ButtonDiv>
    </div>
  );
};

export default GroupComponent;

import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setPeopleProfileModalOpen } from "../../../profile-page/people-profile/peopleProfileSlice";
import * as React from "react";
import { Card, ButtonMenu, MenuItem } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { getLoginData } from "~utils/tokenStorage";

const StyledCard = styled(Card)`
  background-color: ${(props) => props.theme.rainbow.palette.background.secondary};
`;

const UserCardComponent = (props: any) => {
  const peopleProfileState = useSelector((state: RootState) => state.peopleProfileState);
  const { userId, icon, title, creatorId } = props;
  const dispatch = useDispatch();
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
                  <MenuItem label="Kick User Out" />
                  <MenuItem label="Mute" />
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

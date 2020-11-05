// LICENSE: This is a react porting version of https://github.com/cracker0dks/whiteboard

/* eslint-disable jsx-a11y/alt-text */
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "~app/rootReducer";
import { Logger, LogType } from "~utils/logger";
import { getLoginData } from "~utils/tokenStorage";
import "./js/index";
import main, { setAllowWhiteboard } from "./js/main";
import ReadOnlyService from "./js/services/ReadOnlyService";

declare module "react" {
  interface HTMLAttributes<T> {
    tool?: string;
  }
}

const Toolbar = styled.div`
  position: absolute;
  top: 90%;
  left: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const WhiteboardLockButton = styled.button`
  background-color: orange;
`;

const WhiteboardTrashButtonConfirm = styled.button`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 46px;
  display: none;
`;

const StyledWhiteboard = styled.div`
  background-color: white;
`;

const Whiteboard = (props: any) => {
  const userCardState = useSelector((state: RootState) => state.userCardState);
  const { roomId, creatorId } = props;
  const [thickness, setThickness] = useState(3);
  const logger = Logger.getInstance();
  useEffect(() => {
    main(roomId);
    // ReadOnlyService.activateReadOnlyMode();
  }, [roomId]);

  useEffect(() => {
    setAllowWhiteboard(userCardState.allowWhiteboard);
    if (userCardState.allowWhiteboard) {
      ReadOnlyService.deactivateReadOnlyMode();
      logger.log(LogType.WhiteboardAllow, roomId, `gained whiteboard permissions`);
    } else {
      ReadOnlyService.activateReadOnlyMode();
      logger.log(LogType.WhiteboardAllow, roomId, `lost whiteboard permissions`);
    }
  }, [userCardState.allowWhiteboard]);
  return (
    <StyledWhiteboard id="whiteboard">
      <div id="whiteboardContainer"></div>

      <Toolbar>
        {creatorId === getLoginData().id ? (
          <div className="btn-group">
            <WhiteboardLockButton id="whiteboardLockBtn" title="View and Write" type="button">
              <i className="fa fa-lock"></i>
            </WhiteboardLockButton>
            <button id="whiteboardUnlockBtn" title="View Only" type="button">
              <i className="fa fa-lock-open"></i>
            </button>
          </div>
        ) : null}

        <div className="btn-group whiteboard-edit-group">
          <button id="whiteboardTrashBtn" title="Clear the whiteboard" type="button">
            <i className="fa fa-trash"></i>
          </button>
          <WhiteboardTrashButtonConfirm id="whiteboardTrashBtnConfirm" title="Confirm clear..." type="button">
            <i className="fa fa-check"></i>
          </WhiteboardTrashButtonConfirm>
          <button id="whiteboardUndoBtn" title="Undo your last step" type="button">
            <i className="fa fa-undo"></i>
          </button>
          <button id="whiteboardRedoBtn" title="Redo your last undo" type="button">
            <i className="fa fa-redo"></i>
          </button>
        </div>

        <div className="btn-group whiteboard-edit-group">
          <button tool="mouse" title="Take the mouse" type="button" className="whiteboard-tool">
            <i className="fa fa-mouse-pointer"></i>
          </button>
          <button
            style={{ padding: "0px" }}
            tool="recSelect"
            title="Select an area"
            type="button"
            className="whiteboard-tool"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M1 9h2V7H1v2zm0 4h2v-2H1v2zm0-8h2V3c-1.1 0-2 .9-2 2zm8 16h2v-2H9v2zm-8-4h2v-2H1v2zm2 4v-2H1c0 1.1.9 2 2 2zM21 3h-8v6h10V5c0-1.1-.9-2-2-2zm0 14h2v-2h-2v2zM9 5h2V3H9v2zM5 21h2v-2H5v2zM5 5h2V3H5v2zm16 16c1.1 0 2-.9 2-2h-2v2zm0-8h2v-2h-2v2zm-8 8h2v-2h-2v2zm4 0h2v-2h-2v2z" />
            </svg>
            {/* <img src={selectAll} /> */}
          </button>
          <button tool="pen" title="Take the pen" type="button" className="whiteboard-tool">
            <i className="fa fa-pencil-alt"></i>
          </button>
          <button style={{ padding: "0px" }} tool="line" title="Draw a line" type="button" className="whiteboard-tool">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              // eslint-disable-next-line react/no-unknown-property
              enableBackground="new 0 0 24 24"
              viewBox="0 0 24 24"
              fill="black"
              width="24px"
              height="24px"
            >
              <g>
                <rect fill="none" height="24" width="24" />
              </g>
              <g>
                <g>
                  <g>
                    <path d="M23,8c0,1.1-0.9,2-2,2c-0.18,0-0.35-0.02-0.51-0.07l-3.56,3.55C16.98,13.64,17,13.82,17,14c0,1.1-0.9,2-2,2s-2-0.9-2-2 c0-0.18,0.02-0.36,0.07-0.52l-2.55-2.55C10.36,10.98,10.18,11,10,11s-0.36-0.02-0.52-0.07l-4.55,4.56C4.98,15.65,5,15.82,5,16 c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2c0.18,0,0.35,0.02,0.51,0.07l4.56-4.55C8.02,9.36,8,9.18,8,9c0-1.1,0.9-2,2-2s2,0.9,2,2 c0,0.18-0.02,0.36-0.07,0.52l2.55,2.55C14.64,12.02,14.82,12,15,12s0.36,0.02,0.52,0.07l3.55-3.56C19.02,8.35,19,8.18,19,8 c0-1.1,0.9-2,2-2S23,6.9,23,8z" />
                  </g>
                </g>
              </g>
            </svg>
          </button>
          <button tool="rect" title="Draw a rectangle" type="button" className="whiteboard-tool">
            <i className="far fa-square"></i>
          </button>
          <button tool="circle" title="Draw a circle" type="button" className="whiteboard-tool">
            <i className="far fa-circle"></i>
          </button>
          <button tool="text" title="Write text" type="button" className="whiteboard-tool">
            <i className="fas fa-font"></i>
          </button>
          <button tool="eraser" title="Take the eraser" type="button" className="whiteboard-tool">
            <i className="fa fa-eraser"></i>
          </button>
        </div>

        <div className="btn-group whiteboard-edit-group">
          <div style={{ width: "190px", cursor: "default" }}>
            <input
              title="Thickness"
              id="whiteboardThicknessSlider"
              style={{ position: "absolute", left: "9px", width: "130px", top: "15px" }}
              type="range"
              min="1"
              max="50"
              value={thickness}
              onChange={(e) => setThickness(parseInt(e.target.value))}
            />
            <div
              id="whiteboardColorpicker"
              style={{
                position: "absolute",
                left: "155px",
                top: "10px",
                width: "26px",
                height: "23px",
                borderRadius: "3px",
                border: "1px solid darkgrey"
              }}
              data-color="#000000"
            ></div>
          </div>
        </div>

        <div className="btn-group">
          <button id="saveAsImageBtn" title="Save whiteboard as image" type="button">
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </Toolbar>
    </StyledWhiteboard>
  );
};

export default Whiteboard;

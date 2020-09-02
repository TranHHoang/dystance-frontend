import React, { useState } from "react";
import "./CreateRoomForm.css";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "20%",
    left: "30%",
    right: "30%",
    bottom: "30%"
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,.5)"
  }
};
export const CreateRoomForm = () => {
  const today = new Date();
  const date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [classroomName, setClassroomName] = useState("");
  const [startDate, setStartDate] = useState(date);
  const [isWeekly, setIsWeekly] = useState(false);
  const days = [
    { id: 1, value: "Monday", isChecked: false },
    { id: 2, value: "Tuesday", isChecked: false },
    { id: 3, value: "Wednesday", isChecked: false },
    { id: 4, value: "Thursday", isChecked: false },
    { id: 5, value: "Friday", isChecked: false },
    { id: 6, value: "Saturday", isChecked: false },
    { id: 7, value: "Sunday", isChecked: false }
  ];
  const onClassroomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setClassroomName(e.target.value);
  const onStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value);

  return (
    <div>
      <button onClick={() => setModalIsOpen(true)}>Create Room</button>
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} style={customStyles}>
        <h1>Create Classroom</h1>
        <form className="create-room-container">
          <label htmlFor="classroomName">Classroom Name: </label>
          <input
            type="text"
            id="classroomName"
            value={classroomName}
            onChange={onClassroomNameChange}
            required={true}
          />
          <div className="first-row">
            <div className="form-section">
              <label htmlFor="instructorName">Start Date: </label>
              <input type="date" id="startDate" value={startDate} onChange={onStartDateChange} />
            </div>
          </div>
          <div className="form-section" id="weekly-class-section">
            <label htmlFor="isWeekly">Weekly Class: </label>
            <input
              type="checkbox"
              id="isWeekly"
              name="Weekly"
              checked={isWeekly}
              onChange={() => setIsWeekly(!isWeekly)}
            />
          </div>
          <textarea name="description" placeholder="Add class description..." />
          <div>
            <button onClick={() => setModalIsOpen(false)}>Cancel</button>
            <button>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

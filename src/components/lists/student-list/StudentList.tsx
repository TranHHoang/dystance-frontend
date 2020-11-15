import React, { useEffect } from "react";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import { showStudentList } from "./StudentListSlice";
import StudentTeacherTableComponent from "../StudentTeacherTableComponent";

const StudentList = () => {
  const studentListState = useSelector((state: RootState) => state.studentListState);
  const dispatch = useDispatch();
  const studentData = studentListState.students.map((student) => ({
    ...student
  }));
  useEffect(() => {
    dispatch(showStudentList());
  }, []);

  return <StudentTeacherTableComponent data={studentData} title="Student List" isStudent={true} />;
};

export default StudentList;

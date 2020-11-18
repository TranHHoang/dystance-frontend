import React, { useEffect } from "react";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import { resetStudentList, showStudentList } from "./StudentListSlice";
import StudentTeacherTableComponent from "../StudentTeacherTable";

const StudentList = () => {
  const studentListState = useSelector((state: RootState) => state.studentListState);
  const dispatch = useDispatch();
  const studentData = studentListState.students.map((student) => ({
    ...student
  }));

  useEffect(() => {
    setTimeout(() => {
      dispatch(showStudentList());
    }, 2000);
    return () => {
      dispatch(resetStudentList());
    };
  }, []);

  return (
    <StudentTeacherTableComponent
      data={studentData}
      title="Student List"
      isStudent={true}
      isLoading={studentListState.isLoading}
    />
  );
};

export default StudentList;

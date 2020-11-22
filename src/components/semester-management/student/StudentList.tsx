import React, { useEffect } from "react";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import { resetStudentList, showStudentList } from "./StudentListSlice";
import StudentTeacherTableComponent from "../StudentTeacherTable";

const StudentList = (props: any) => {
  const { semesterId } = props;
  const studentListState = useSelector((state: RootState) => state.studentListState);
  const dispatch = useDispatch();
  const studentData = studentListState.students.map((student) => ({
    ...student
  }));

  useEffect(() => {
    dispatch(showStudentList(semesterId));
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
      semesterId={semesterId}
    />
  );
};

export default StudentList;

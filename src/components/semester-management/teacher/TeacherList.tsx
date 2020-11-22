import React, { useEffect } from "react";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import StudentTeacherTable from "../StudentTeacherTable";
import { resetTeacherList, showTeacherList } from "./teacherListSlice";

const TeacherList = (props: any) => {
  const { semesterId } = props;
  const teacherListState = useSelector((state: RootState) => state.teacherListState);
  const dispatch = useDispatch();
  const teacherData = teacherListState.teachers.map((teacher) => ({
    ...teacher
  }));
  useEffect(() => {
    dispatch(showTeacherList(semesterId));
    return () => {
      dispatch(resetTeacherList());
    };
  }, []);

  return (
    <StudentTeacherTable
      data={teacherData}
      title="Teacher List"
      isStudent={false}
      isLoading={teacherListState.isLoading}
      semesterId={semesterId}
    />
  );
};

export default TeacherList;

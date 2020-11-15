import React, { useEffect } from "react";
import { RootState } from "~app/rootReducer";
import { useDispatch, useSelector } from "react-redux";
import StudentTeacherTableComponent from "../StudentTeacherTableComponent";
import { resetTeacherList, showTeacherList } from "./teacherListSlice";

const TeacherList = () => {
  const teacherListState = useSelector((state: RootState) => state.teacherListState);
  const dispatch = useDispatch();
  const teacherData = teacherListState.teachers.map((teacher) => ({
    ...teacher
  }));
  useEffect(() => {
    dispatch(showTeacherList());
    return () => {
      dispatch(resetTeacherList());
    };
  }, []);

  return <StudentTeacherTableComponent data={teacherData} title="Teacher List" isStudent={false} />;
};

export default TeacherList;

import React from "react";
import { hot } from "react-hot-loader";
import { PostList } from "../example/post/PostList";
import { AddPostForm } from "../example/post/AddPostForm";
import { CreateRoomForm } from "../components/room-management/create-room/CreateRoomForm";

export default hot(module)(function App() {
  return (
    <React.Fragment>
      {/*<AddPostForm />*/}
      {/*<PostList />*/}
      <CreateRoomForm />
    </React.Fragment>
  );
});

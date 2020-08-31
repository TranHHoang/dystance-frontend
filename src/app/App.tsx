import React from "react";
import { hot } from "react-hot-loader";
import { PostList } from "../example/post/PostList";
import { AddPostForm } from "../example/post/AddPostForm";

export default hot(module)(function App() {
    return (
        <React.Fragment>
            <AddPostForm />
            <PostList />
        </React.Fragment>
    );
});

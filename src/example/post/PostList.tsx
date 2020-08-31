import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/rootReducer";

export const PostList = () => {
    const posts = useSelector((state: RootState) => state.posts);
    const renderedPosts = posts.map((post) => (
        <article>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
        </article>
    ));

    return (
        <section>
            <h2>Posts</h2>
            {renderedPosts}
        </section>
    );
};

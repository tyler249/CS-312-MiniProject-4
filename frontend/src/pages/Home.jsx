import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/posts", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts);
        setUser(data.user || null);
      })
      .catch(err => console.error("Error loading posts:", err));
  }, []);

  return (
    <div>
      <h1>Welcome to the Blog!</h1>

      {user ? (
        <p style={{ textAlign: "center" }}>
          Logged in as <b>{user.name}</b> |{" "}
          <a href="http://localhost:3000/api/logout">Logout</a>
        </p>
      ) : (
        <p style={{ textAlign: "center" }}>
          <Link to="/login">Login</Link> or <Link to="/signup">Sign up</Link> to create posts.
        </p>
      )}

      {user && (
        <Link to="/create">
          <button>Create Blog Post</button>
        </Link>
      )}

      {posts.length === 0 ? (
        <p>No posts yet...</p>
      ) : (
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <h4>Post by: {post.author_name}</h4>
              <small>Created at: {new Date(post.date_created).toLocaleString()}</small>
              <br />
              {user && post.creator_user_id === user.id && (
                <>
                  <Link to={`/edit/${post.id}`}>
                    <button>Edit</button>
                  </Link>
                  <button
                    onClick={() => {
                      fetch(`http://localhost:3000/api/posts/${post.id}`, {
                        method: "DELETE",
                        credentials: "include"
                      }).then(() => window.location.reload());
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

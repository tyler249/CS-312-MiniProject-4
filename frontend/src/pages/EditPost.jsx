import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({ title: "", body: "" });

  useEffect(() => {
    fetch(`http://localhost:3000/api/posts/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:3000/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(post),
    });
    navigate("/");
  };

  return (
    <div>
      <h1>Edit Post</h1>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          value={post.title}
          onChange={e => setPost({ ...post, title: e.target.value })}
          required
        />

        <label>Body:</label>
        <textarea
          rows="5"
          value={post.body}
          onChange={e => setPost({ ...post, body: e.target.value })}
          required
        ></textarea>

        <button type="submit">Save Changes</button>
      </form>
      <button onClick={() => navigate("/")}>Cancel</button>
    </div>
  );
}

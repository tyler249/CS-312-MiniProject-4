import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Create() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", body: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    navigate("/");
  };

  return (
    <div>
      <h1>Create a New Blog Post</h1>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />

        <label>Body:</label>
        <textarea
          name="body"
          rows="5"
          value={form.body}
          onChange={e => setForm({ ...form, body: e.target.value })}
          required
        ></textarea>

        <button type="submit">Submit</button>
      </form>
      <button onClick={() => navigate("/")}>Cancel</button>
    </div>
  );
}

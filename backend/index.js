import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allow React frontend to communicate with backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// Auth guard
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login required" });
  }
  next();
}

// Auth Routes

// Signup
app.post("/api/signup", async (req, res) => {
  const { user_id, name, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
      [user_id, password, name]
    );
    res.json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Username already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Error creating user" });
    }
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    const user = result.rows[0];
    if (user && user.password === password) {
      req.session.user = { id: user.user_id, name: user.name };
      req.session.save(() => res.json({ message: "Login successful", user: req.session.user }));
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Logout
app.get("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT blogs.blog_id AS id,
             blogs.title,
             blogs.body,
             blogs.date_created,
             blogs.creator_user_id,
             users.name AS author_name
      FROM blogs
      JOIN users ON blogs.creator_user_id = users.user_id
      ORDER BY date_created DESC;
    `);

    const posts = result.rows.map((p) => ({
      ...p,
      createdAt: new Date(p.date_created),
    }));

    res.json({ posts, user: req.session.user || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading posts" });
  }
});

// Get single post
app.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT blogs.*, users.name AS author_name
      FROM blogs
      JOIN users ON blogs.creator_user_id = users.user_id
      WHERE blogs.blog_id = $1
    `,
      [id]
    );

    const post = result.rows[0];
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading post" });
  }
});

// Create new post
app.post("/api/posts", requireLogin, async (req, res) => {
  const { title, body } = req.body;
  const date_created = new Date();
  try {
    await pool.query(
      "INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, $5)",
      [req.session.user.name, req.session.user.id, title, body, date_created]
    );
    res.json({ message: "Post created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating post" });
  }
});

// Edit post
app.put("/api/posts/:id", requireLogin, async (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  try {
    const result = await pool.query(
      "UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3 AND creator_user_id = $4 RETURNING *",
      [title, body, id, req.session.user.id]
    );

    if (result.rowCount === 0)
      return res.status(403).json({ error: "You can only edit your own posts" });

    res.json({ message: "Post updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating post" });
  }
});

// Delete post
app.delete("/api/posts/:id", requireLogin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2",
      [id, req.session.user.id]
    );

    if (result.rowCount === 0)
      return res.status(403).json({ error: "You can only delete your own posts" });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting post" });
  }
});

// Server Start
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

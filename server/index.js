const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

// API routes here...

// Serve frontend
app.use(express.static(path.join(__dirname, "../client/dist"))); // or "../client/build"

// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

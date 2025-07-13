const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

// Mock slot data
let slots = [
  { id: "2025-07-13-0", date: "2025-07-13", index: 0, available: true },
  { id: "2025-07-13-1", date: "2025-07-13", index: 1, available: true },
];

// GET slots (example endpoint)
app.get("/api/slots", (req, res) => {
  res.json(slots);
});

// POST request to book a slot
app.post("/api/request-slot", (req, res) => {
  const { slotId } = req.body;
  const slot = slots.find(s => s.id === slotId);
  if (!slot) {
    return res.status(404).json({ error: "Slot not found" });
  }
  if (!slot.available) {
    return res.status(400).json({ error: "Slot already booked" });
  }
  slot.available = false;
  res.json({ success: true, slot });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../client/dist")));

// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

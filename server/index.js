const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SLOT_TIMES = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00"
];

// Memory store: date -> slots
const slotsByDate = {};

// Generate slots for a given date (YYYY-MM-DD)
function generateSlots(date) {
  return SLOT_TIMES.map((time, idx) => ({
    id: `${date}-${idx}`,
    date,
    time,
    status: "open",
    requestedBy: null
  }));
}

// Get slots for a given date
function getSlots(date) {
  if (!slotsByDate[date]) {
    slotsByDate[date] = generateSlots(date);
  }
  return slotsByDate[date];
}

// User: get slots for a date
app.get("/api/slots", (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: "Missing date" });
  res.json(getSlots(date));
});

// User: request a slot
app.post("/api/request-slot", (req, res) => {
  const { id, user } = req.body;
  if (!id || !user) return res.status(400).json({ error: "Missing data" });
  const [date] = id.split("-");
  const slots = getSlots(date);
  const slot = slots.find((s) => s.id === id);
  if (!slot) return res.status(404).json({ error: "Slot not found" });
  if (slot.status !== "open") return res.status(400).json({ error: "Slot not available" });
  slot.status = "pending";
  slot.requestedBy = user;
  res.json({ success: true, slot });
});

// Admin: accept/reject
app.post("/api/review-slot", (req, res) => {
  const { id, action } = req.body;
  if (!id || !action) return res.status(400).json({ error: "Missing data" });
  const [date] = id.split("-");
  const slots = getSlots(date);
  const slot = slots.find((s) => s.id === id);
  if (!slot) return res.status(404).json({ error: "Slot not found" });
  if (slot.status !== "pending") return res.status(400).json({ error: "Slot not pending" });
  if (action === "accept") {
    slot.status = "booked";
  } else {
    slot.status = "open";
    slot.requestedBy = null;
  }
  res.json({ success: true, slot });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

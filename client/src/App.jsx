import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = "https://learn-agxg.onrender.com";

function formatDate(date) {
  // Ensures date is in YYYY-MM-DD format
  return date.toISOString().split("T")[0];
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [user, setUser] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [status, setStatus] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Load slots when date changes
  useEffect(() => {
    fetch(`${API_BASE}/api/slots?date=${formatDate(selectedDate)}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data);
        setSelectedSlotId(null); // Reset selected slot on date change
        setStatus(""); // Clear status
      });
  }, [selectedDate]);

  // Handle slot selection
  function handleSlotSelect(id, slotStatus) {
    if (slotStatus === "open") {
      setSelectedSlotId(id);
      setStatus(""); // Clear status on selection
    }
  }

  // Handle slot submission
  function handleSubmit() {
    if (!user) {
      setStatus("Please enter your name.");
      return;
    }
    if (!selectedSlotId) {
      setStatus("Please select a slot.");
      return;
    }
    fetch(`${API_BASE}/api/request-slot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedSlotId, user }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("Selected slot successfully!");
          setSlots(slots.map((s) => (s.id === selectedSlotId ? data.slot : s)));
          setSelectedSlotId(null);
        } else {
          setStatus(data.error || "Failed to select slot.");
        }
      });
  }

  // Admin review (accept/reject)
  function reviewSlot(id, action) {
    fetch(`${API_BASE}/api/review-slot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSlots(slots.map((s) => (s.id === id ? data.slot : s)));
        } else {
          setStatus(data.error || "Failed to update slot.");
        }
      });
  }

  return (
    <div style={{ margin: "2rem auto", maxWidth: 500 }}>
      <h1>Calendar Slot Booking App</h1>
      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
        />
        <button style={{ marginLeft: "1rem" }} onClick={() => setIsAdmin(!isAdmin)}>
          {isAdmin ? "Switch to User" : "Switch to Admin"}
        </button>
      </div>
      {!isAdmin ? (
        <div>
          <input
            placeholder="Your name"
            value={user}
            onChange={e => setUser(e.target.value)}
            style={{ marginBottom: "1rem", width: "100%", boxSizing: "border-box" }}
          />
          <ul style={{ listStyle: "none", padding: 0 }}>
            {slots.map(slot => (
              <li
                key={slot.id}
                style={{
                  margin: "0.5rem 0",
                  padding: "0.75rem",
                  border: "1px solid #ccc",
                  background: slot.status === "open"
                    ? (selectedSlotId === slot.id ? "#a0e0ff" : "#e0ffe0")
                    : slot.status === "pending"
                      ? "#fffbe0"
                      : "#eee",
                  color: slot.status === "booked" ? "#999" : "#222",
                  cursor: slot.status === "open" ? "pointer" : "not-allowed",
                  opacity: slot.status === "booked" ? 0.5 : 1,
                  fontWeight: selectedSlotId === slot.id ? "bold" : "normal"
                }}
                onClick={() => handleSlotSelect(slot.id, slot.status)}
              >
                <b>{slot.time}</b> — {slot.status.toUpperCase()}
                {slot.status === "pending" && (
                  <span> (Requested by {slot.requestedBy})</span>
                )}
                {slot.status === "booked" && (
                  <span> (Booked by {slot.requestedBy})</span>
                )}
              </li>
            ))}
          </ul>
          <button
            style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", fontSize: "1rem" }}
            onClick={handleSubmit}
            disabled={!selectedSlotId || !user}
          >
            Submit
          </button>
          {status && (
            <div style={{ marginTop: "1rem", color: status.includes("successfully") ? "green" : "red" }}>
              {status}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Admin Panel</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {slots
              .filter(slot => slot.status === "pending")
              .map(slot => (
                <li
                  key={slot.id}
                  style={{
                    margin: "0.5rem 0",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    background: "#ffe0e0",
                  }}
                >
                  <b>{slot.time}</b> — Requested by <b>{slot.requestedBy}</b>
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={() => reviewSlot(slot.id, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    style={{ marginLeft: "0.5rem" }}
                    onClick={() => reviewSlot(slot.id, "reject")}
                  >
                    Reject
                  </button>
                </li>
              ))}
            {slots.filter(slot => slot.status === "pending").length === 0 && (
              <li>No pending requests for this date.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

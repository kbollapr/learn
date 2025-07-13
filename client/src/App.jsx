import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [user, setUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  function fetchSlots(date) {
    fetch("https://learn-agxg.onrender.com/api/slots?date=2025-07-13")
      .then((res) => res.json())
      .then(setSlots);
  }

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  function requestSlot(id) {
    fetch("/api/request-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, user }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSlots(slots.map((s) => (s.id === id ? data.slot : s)));
        } else {
          alert(data.error);
        }
      });
  }

  function reviewSlot(id, action) {
    fetch("/api/review-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSlots(slots.map((s) => (s.id === id ? data.slot : s)));
        } else {
          alert(data.error);
        }
      });
  }

  return (
    <div style={{ margin: "2rem auto", maxWidth: 500 }}>
      <h1>Calendar Slot Booking App</h1>
      <div style={{ marginBottom: "1rem" }}>
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
                    ? "#e0ffe0"
                    : slot.status === "pending"
                      ? "#fffbe0"
                      : "#eee",
                  color: slot.status === "booked" ? "#999" : "#222",
                  cursor: slot.status === "open" ? "pointer" : "not-allowed",
                  opacity: slot.status === "booked" ? 0.5 : 1,
                }}
                onClick={() =>
                  slot.status === "open" && user && requestSlot(slot.id)
                }
                title={slot.status === "open" && !user ? "Enter your name to book" : ""}
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

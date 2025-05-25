// frontend/src/components/EmojiFlow.jsx
import React from "react";

export default function EmojiFlow({ flow }) {
  // flow: [{ emoji: "🚶", text: "공원 산책" }, …]
  return (
    <section>
      <h3>😊 감정 흐름</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {flow.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>{step.emoji}</div>
              <div style={{ fontSize: "0.9rem", color: "#555" }}>
                {step.text}
              </div>
            </div>
            {i < flow.length - 1 && (
              <div style={{ fontSize: "1.5rem", margin: "0 0.25rem" }}>
                →
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
);
}

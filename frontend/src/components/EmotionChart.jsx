// frontend/src/components/EmotionChart.jsx
import React from "react";
import "./EmotionChart.css";

export default function EmotionChart({ data }) {
  return (
    <section className="emotion-chart">
      <h3>📊 감정 점수</h3>
      {data.map((d, i) => {
        const percent = Math.round(d.score * 100);
        return (
          <div key={i} className="emotion-row">
            <span className="emotion-label">{d.label}</span>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="emotion-value">{percent}점</span>
          </div>
        );
      })}
    </section>
  );
}

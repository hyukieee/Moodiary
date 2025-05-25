// src/pages/History.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useDiaryStore from "../stores/diaryStore";
import "./History.css";

export default function History() {
  const entries = useDiaryStore((s) => s.entries);
  const deleteEntry = useDiaryStore((s) => s.deleteEntry);
  const navigate = useNavigate();

  // Calendar와 동일한 색 결정 로직
  const colorFor = (emotions) => {
    if (!emotions || emotions.length === 0) return "#ddd";
    // 최고 점수 감정 하나를 꺼내서
    const top = emotions.reduce((a, b) => (b.score > a.score ? b : a));
    const label = top.label;
    if (label.includes("기쁨") || label.includes("행복")) return "#FFD700";
    if (label.includes("분노") || label.includes("화남")) return "#FF4500";
    if (label.includes("슬픔") || label.includes("우울")) return "#1E90FF";
    // 그 외
    return "#A9A9A9";
  };

  // 날짜 역순 정렬
  const sorted = Object.entries(entries).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  return (
    <div className="history-page">
      <h2>📦 일기 기록</h2>
      <ul className="history-list">
        {sorted.map(([date, entry]) => {
          const bg = colorFor(entry.emotions);
          return (
            <li
              key={date}
              className="history-item"
              style={{ background: bg, color: "#000" }}
            >
              <Link to={`/result/${date}`} className="history-link">
                {date} – {entry.title || "제목 없음"}
              </Link>
              <div className="history-buttons">
                <button
                  onClick={() => {
                    deleteEntry(date);
                  }}
                >
                  삭제
                </button>
                <button onClick={() => navigate(`/edit/${date}`)}>
                  수정
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

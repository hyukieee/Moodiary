// src/pages/History.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useDiaryStore from "../stores/diaryStore";
import "./History.css";

export default function History() {
  const entries = useDiaryStore((s) => s.entries);
  const deleteEntry = useDiaryStore((s) => s.deleteEntry);
  const navigate = useNavigate();

  const COLOR_MAP = {
    Joy:      "#FFD54F",
    Sadness:  "#1E90FF",
    Anger:    "#FF4500",
    Fear:     "#9575CD",
    Surprise: "#FF7F00",
    Calm:     "#AED581",
  };

  const TRANSLATE = {
    기쁨:    "Joy",
    행복:    "Joy",
    슬픔:    "Sadness",
    우울:    "Sadness",
    분노:    "Anger",
    화남:    "Anger",
    불안:    "Fear",
    긴장:    "Fear",
    놀람:    "Surprise",
    평온:    "Calm",
  };

  // dominantEmotion 한글 → 색상
  const colorFor = (dominant) => {
    if (!dominant) return "#DDD";
    const eng = TRANSLATE[dominant] || dominant; 
    return COLOR_MAP[eng] || "#DDD";
  };

  // 날짜 내림차순
  const sorted = Object.entries(entries).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  return (
    <div className="history-page">
      <h2>📦 일기 기록</h2>
      <ul className="history-list">
        {sorted.map(([date, entry]) => (
          <li
            key={date}
            className="history-item"
            style={{ background: colorFor(entry.dominantEmotion), color: "#000" }}
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
        ))}
      </ul>
    </div>
  );
}

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useDiaryStore from "../stores/diaryStore";
import "./History.css";

export default function History() {
  const entries = useDiaryStore((s) => s.entries);
  const deleteEntry = useDiaryStore((s) => s.deleteEntry);
  const navigate = useNavigate();

  // 6대 기본 감정별 컬러맵 (영어 key)
  const COLOR_MAP = {
    Joy:      "#FFD54F",
    Sadness:  "#1E90FF",
    Anger:    "#FF4500",
    Fear:     "#9575CD",
    Surprise: "#FFB74D",
    Calm:     "#AED581",
  };

  // 한글 레이블 → 영어 매핑
  const TRANSLATE = {
    기쁨: "Joy",
    행복: "Joy",
    슬픔: "Sadness",
    우울: "Sadness",
    분노: "Anger",
    화남: "Anger",
    불안: "Fear",
    긴장: "Fear",
    놀람: "Surprise",
    평온: "Calm",
  };

  // dominantEmotion(한글) → 배경색 계산
  const colorFor = (dominant) => {
    if (!dominant) return "#DDD";
    const eng = TRANSLATE[dominant] || dominant;      // 한글 → 영어
    return COLOR_MAP[eng] || "#DDD";                 // 영어 → 색
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
          const bg = colorFor(entry.dominantEmotion);
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
                <button onClick={() => deleteEntry(date)}>삭제</button>
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

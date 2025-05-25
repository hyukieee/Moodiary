// frontend/src/pages/Result.jsx
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import useDiaryStore from "../stores/diaryStore";
import EmojiFlow from "../components/EmojiFlow";
import EmotionChart from "../components/EmotionChart";
import Recommendations from "../components/Recommendations";

export default function Result() {
  const { date } = useParams();
  const entry = useDiaryStore((s) => s.entries[date]);

  if (!entry) {
    return <Navigate to="/" replace />;
  }

  // 상위 5개 감정만
  const top5Emotions = [...entry.emotions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="result-page">
      <h2>{entry.title || date}</h2>

      <section className="diary-text">
        <h3>📝 오늘의 일기</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{entry.diaryText}</p>
      </section>

      {/* 이모지 + 행동 흐름 */}
      <section className="emoji-flow-section">
        <EmojiFlow flow={entry.emojiFlow} />
      </section>

      <section className="emotion-chart-section">
        <EmotionChart data={top5Emotions} />
      </section>

      <section className="highlights-section">
        <h3>📑 하이라이트</h3>
        <ul>
          {entry.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="recap-section">
        <h3>🔖 리캡</h3>
        <p>{entry.recap}</p>
      </section>

      <section className="recommendations-section">
        <Recommendations data={entry.recommendations} />
      </section>
    </div>
  );
}

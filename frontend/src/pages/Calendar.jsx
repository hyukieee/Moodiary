// frontend/src/pages/Calendar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useDiaryStore from "../stores/diaryStore";
import "./Calendar.css";

export default function Calendar() {
  const entries = useDiaryStore((s) => s.entries);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());


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

  const COLOR_MAP = {
    Joy:      "#FFD54F",
    Sadness:  "#1E90FF",
    Anger:    "#FF4500",
    Fear:     "#9575CD",
    Surprise: "#FFB74D",
    Calm:     "#AED581",
  };

  

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const totalDays    = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const weeks = [];
  let day = 1 - startWeekday;
  while (day <= totalDays) {
    const wk = [];
    for (let i = 0; i < 7; i++, day++) {
      if (day < 1 || day > totalDays) {
        wk.push(null);
      } else {
        const d = String(day).padStart(2,"0");
        const m = String(month+1).padStart(2,"0");
        const key = `${year}-${m}-${d}`;
        wk.push({ date: key, entry: entries[key] });
      }
    }
    weeks.push(wk);
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y-1); setMonth(11); }
    else setMonth(m => m-1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y+1); setMonth(0); }
    else setMonth(m => m+1);
  };

  const colorFor = (dominant) => {
    if (!dominant) return "#DDD";
    // 한글 감정 레이블(ex: "분노")이 나오면 TRANSLATE로 영어로 변환
    const eng = TRANSLATE[dominant] || dominant;
    return COLOR_MAP[eng] || "#DDD";
  };
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>◀︎</button>
        <h2>{year}년 {month+1}월</h2>
        <button onClick={nextMonth}>▶︎</button>
      </div>
      <div className="calendar-grid">
        {["일","월","화","수","목","금","토"].map(w => (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
        {weeks.flat().map((cell,i) => {
          const bg = cell?.entry
            ? colorFor(cell.entry.dominantEmotion)
            : "#EEE";
          const num = cell ? Number(cell.date.split("-")[2]) : "";
          return cell?.entry ? (
            <Link to={`/result/${cell.date}`} key={i} className="calendar-cell-link">
              <div className="calendar-cell" style={{ backgroundColor: bg }}>
                {num}
              </div>
            </Link>
          ) : (
            <div key={i} className="calendar-cell" style={{ backgroundColor: bg }}>
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

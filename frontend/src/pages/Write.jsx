// frontend/src/pages/Write.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useDiaryStore from "../stores/diaryStore";
import "./Write.css";

export default function Write({ editMode = false }) {
  const { date: paramDate } = useParams();
  const entries = useDiaryStore((s) => s.entries);
  const addEntry = useDiaryStore((s) => s.addEntry);
  const updateEntry = useDiaryStore((s) => s.updateEntry);
  const navigate = useNavigate();

  // 폼 상태
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // 수정 모드라면 기존 데이터를 불러와 폼에 채우기
  useEffect(() => {
    if (editMode && paramDate && entries[paramDate]) {
      const e = entries[paramDate];
      setDate(paramDate);
      setTitle(e.title || "");
      setText(e.diaryText || "");
    }
  }, [editMode, paramDate, entries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !text.trim()) {
      return alert("날짜와 일기 내용을 입력해주세요.");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, title, diaryText: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");

      // 저장: 신규 or 수정
      if (editMode) updateEntry(date, data);
      else addEntry(date, data);

      navigate(`/result/${date}`);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      alert("분석 중 오류가 발생했습니다:\n" + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="write-page">
      <h2>{editMode ? "일기 수정" : "일기 작성"}</h2>
      <form className="write-form" onSubmit={handleSubmit}>
        <label>
          날짜:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={editMode} // 수정 시 날짜 변경 금지
            required
          />
        </label>

        <label>
          제목:
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          일기 내용:
          <textarea
            rows={10}
            placeholder="오늘의 일기를 작성하세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading
            ? "분석 중…"
            : editMode
            ? "수정 완료"
            : "작성 완료"}
        </button>

        {editMode && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/history")}
            disabled={loading}
          >
            취소
          </button>
        )}
      </form>
    </div>
  );
}

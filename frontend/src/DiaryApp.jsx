// frontend/src/components/DiaryApp.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./DiaryApp.css";

export default function DiaryApp({ children }) {
  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>📝 감정 일기장</h1>
        <nav className="app-nav">
          <Link to="/">일기 쓰기</Link>
          <span className="sep">|</span>
          <Link to="/history">기록 보기</Link>
          <span className="sep">|</span>
          <Link to="/calendar">감정 캘린더</Link>
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
      </footer>
    </div>
  );
}

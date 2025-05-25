import { Routes, Route, Navigate } from "react-router-dom";
import DiaryApp from "./DiaryApp";
import Write from "./pages/Write";
import Result from "./pages/Result";
import Calendar from "./pages/Calendar";
import History from "./pages/History";

export default function App() {
  return (
    <DiaryApp>
      <Routes>
        {/* 기본 페이지: 일기 작성 */}
        <Route path="/" element={<Write />} />
        <Route path="/edit/:date" element={<Write editMode />} />
        <Route path="/history" element={<History />} />
        {/* 결과 보기: /result/2025-05-23 처럼 날짜 파라미터 */}
        <Route path="/result/:date" element={<Result />} />

        {/* 월별 감정 캘린더 */}
        <Route path="/calendar" element={<Calendar />} />

        {/* 정의되지 않은 경로는 /로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DiaryApp>
  );
}

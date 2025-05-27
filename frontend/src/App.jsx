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
        <Route path="/" element={<Write />} />
        <Route path="/edit/:date" element={<Write editMode />} />
        <Route path="/history" element={<History />} />
        <Route path="/result/:date" element={<Result />} />

        {/* 월별 감정 캘린더 */}
        <Route path="/calendar" element={<Calendar />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DiaryApp>
  );
}

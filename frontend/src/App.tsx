import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./lists/LoginPage";
import ListsPage from "./lists/ListsPage";
import ListDetailPage from "./lists/ListDetailPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/lists" element={<ListsPage />} />
      <Route path="/lists/:listId" element={<ListDetailPage />} />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

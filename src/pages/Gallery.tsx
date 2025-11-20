import { Routes, Route } from "react-router-dom";
import MediaListPage from "./MediaListPage";
import MediaDetail from "./MediaDetailPage";

export default function Gallery() {
  return (
    <Routes>
      <Route index element={<MediaListPage />} />
      <Route path=":id" element={<MediaDetail />} />
    </Routes>
  );
}

import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import Box from "@mui/material/Box";

export default function App() {
  const navRef = useRef<HTMLDivElement | null>(null);
  const [navHeight, setNavHeight] = useState(72); // 기본값 72px (예비)

  useEffect(() => {
    if (!navRef.current) return;
    // 처음 렌더 시 높이 계산
    const resize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.getBoundingClientRect().height + 16); // +여유 padding
      }
    };

    resize(); // 최초 1회
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <Box
      className="stage"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        pb: `${navHeight}px`, //  자동 여백 반영
        transition: "padding-bottom .3s ease",
      }}
    >
      <AppHeader />

      {/* 콘텐츠 영역 */}
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* 하단 네비게이션 */}
      <div ref={navRef}>
        <BottomNav />
      </div>
    </Box>
  );
}

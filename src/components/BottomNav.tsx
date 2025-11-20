// src/components/BottomNav.tsx
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import HomeRounded from "@mui/icons-material/HomeRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import ForumRounded from "@mui/icons-material/ForumRounded";
import PhotoRounded from "@mui/icons-material/PhotoRounded";
import SportsMotorsportsRounded from "@mui/icons-material/SportsMotorsportsRounded";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { label: "Pit Wall", icon: <HomeRounded />, path: "/" },
  { label: "Race Calendar", icon: <CalendarMonthRounded />, path: "/schedule" },
  { label: "Standings", icon: <EmojiEventsRounded />, path: "/results" },
  { label: "Paddock", icon: <ForumRounded />, path: "/forum" },
  { label: "Media", icon: <PhotoRounded />, path: "/gallery" },
  { label: "My Team", icon: <SportsMotorsportsRounded />, path: "/my" },
];

function matchItem(pathname: string): string | false {
  for (const i of items) {
    if (i.path === "/") {
      if (pathname === "/") return i.path;
    } else if (pathname === i.path || pathname.startsWith(i.path + "/")) {
      return i.path;
    }
  }
  return false;
}

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const value = matchItem(pathname);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 8,
        left: 8,
        right: 8,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "#fff",
        boxShadow: "none",           //  그림자 완전 제거
        overflow: "hidden",          //  라운드 내부 잘림 방지
        zIndex: (t) => t.zIndex.appBar - 1,
      }}
      elevation={0}                 //  MUI 내부 그림자 제거
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newVal) => navigate(newVal)}
        sx={{
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            color: "primary.main",
          },
        }}
      >
        {items.map((i) => (
          <BottomNavigationAction
            key={i.path}
            value={i.path}
            label={i.label}
            icon={i.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

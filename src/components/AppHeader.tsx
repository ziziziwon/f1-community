// src/components/AppHeader.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Button,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import SportsMotorsportsRounded from "@mui/icons-material/SportsMotorsportsRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { SITE_NAME } from "../config";
import { useAuth } from "../stores/auth";

const CATEGORIES = [
  { label: "Pit Wall", path: "/" },
  { label: "Race Calendar", path: "/schedule" },
  { label: "Standings", path: "/results" },
  { label: "Paddock", path: "/forum" },
  { label: "Media", path: "/gallery" },
  { label: "My Team", path: "/my" },
];

function matchCategory(pathname: string): string | false {
  for (const c of CATEGORIES) {
    if (c.path === "/") {
      if (pathname === "/") return c.path;
    } else if (pathname === c.path || pathname.startsWith(c.path + "/")) {
      return c.path;
    }
  }
  return false;
}

export default function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const tabsValue = matchCategory(pathname);

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      {/* 상단바 */}
      <Toolbar
        sx={{ gap: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <SportsMotorsportsRounded sx={{ color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
          {SITE_NAME}
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ ml: "auto", alignItems: "center" }}
        >
          {/*  Settings */}
          <IconButton
            onClick={() => navigate("/settings")}
            color="primary"
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <SettingsRounded fontSize="small" />
          </IconButton>

          {!user ? (
            <Button
              onClick={() => navigate("/login")}
              startIcon={<LoginRounded />}
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              Log in
            </Button>
          ) : (
            <Button
              onClick={logout}
              startIcon={<LogoutRounded />}
              sx={{ fontWeight: 800, color: "text.secondary" }}
            >
              Log out
            </Button>
          )}
        </Stack>
      </Toolbar>

      {/*  하단 탭 */}
      <Toolbar sx={{ minHeight: 44, px: 0, justifyContent: "center" }}>
        <Tabs
          value={tabsValue}
          onChange={(_, v) => navigate(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="site sections"
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: 44,
            "& .MuiTabs-flexContainer": {
              justifyContent: { xs: "flex-start", md: "center" },
            },
            "& .MuiTab-root": {
              minHeight: 44,
              fontWeight: 800,
              color: "text.secondary",
            },
            "& .MuiTab-root.Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": {
              height: 2,
              borderRadius: 1,
              bgcolor: "primary.main",
            },
          }}
        >
          {CATEGORIES.map((c) => (
            <Tab
              key={c.path}
              value={c.path}
              label={c.label}
              component={RouterLink}
              to={c.path}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

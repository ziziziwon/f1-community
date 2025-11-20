import * as React from "react";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import AvTimerRounded from "@mui/icons-material/AvTimerRounded";
import { TEAM_DATA } from "./teams";
import { useSettings } from "../stores/settings";

import DriversTab from "./DriversTab";
import ConstructorsTab from "./ConstructorsTab";
import RacesTab from "./RacesTab";

export default function Results() {
  const [tab, setTab] = React.useState<"drivers" | "constructors" | "races">("drivers");
  const { favoriteTeam } = useSettings();

  const team = favoriteTeam ? TEAM_DATA[favoriteTeam as keyof typeof TEAM_DATA] : null;
  const gradient = team
    ? team.gradient
    : "linear-gradient(120deg, #001489 0%, #0038FF 60%, #7FA2FF 100%)";

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: { xs: 12, md: 10 } }}>
      {/* 💎 Hero */}
      <Box sx={{ position: "relative", mb: 4, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={6}
          sx={{
            borderRadius: 9999,
            p: { xs: 2.5, sm: 3.5 },
            width: "min(900px, 95%)",
            textAlign: "center",
            background: gradient,
            color: "#fff",
            boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {team ? `${team.name} Standings` : "F1 Standings"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
            드라이버 · 컨스트럭터 · 레이스
          </Typography>
        </Paper>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 999,
          px: 1,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "#fff",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": { fontWeight: 800, minHeight: 48 },
            "& .MuiTabs-indicator": { display: "none" },
            "& .Mui-selected": {
              bgcolor: "rgba(0,20,137,.07)",
              borderRadius: 999,
            },
          }}
        >
          <Tab icon={<EmojiEventsRounded />} iconPosition="start" value="drivers" label="드라이버" />
          <Tab icon={<InsightsRounded />} iconPosition="start" value="constructors" label="컨스트럭터" />
          <Tab icon={<AvTimerRounded />} iconPosition="start" value="races" label="레이스" />
        </Tabs>
      </Paper>

      {/* 탭 콘텐츠 */}
      {tab === "drivers" && <DriversTab />}
      {tab === "constructors" && <ConstructorsTab />}
      {tab === "races" && <RacesTab />}
    </Container>
  );
}

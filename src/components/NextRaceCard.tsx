import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
} from "@mui/material";
import BoltRounded from "@mui/icons-material/BoltRounded";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../utils/apiBase";

/** Ergast API 타입 정의 */
type Race = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: { locality: string; country: string };
  };
};

/** 🌍 국가명 → 이모지 국기 변환 매핑 */
const countryToFlag: Record<string, string> = {
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  Australia: "🇦🇺",
  Japan: "🇯🇵",
  China: "🇨🇳",
  Azerbaijan: "🇦🇿",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Canada: "🇨🇦",
  Austria: "🇦🇹",
  "Great Britain": "🇬🇧",
  Hungary: "🇭🇺",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Singapore: "🇸🇬",
  Qatar: "🇶🇦",
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  "United Arab Emirates": "🇦🇪",
};

/**  팀/서킷 컬러 */
const circuitColors: Record<string, string> = {
  Mexico: "#DA291C",
  Japan: "#E60012",
  "United States": "#001489",
  "Great Britain": "#0033A0",
  Italy: "#006847",
  Qatar: "#8A1538",
  Brazil: "#009739",
  Monaco: "#C8102E",
  Austria: "#ED2939",
  Belgium: "#FFD100",
  Netherlands: "#FF4B00",
};

export default function NextRaceCard() {
  const [nextRace, setNextRace] = React.useState<Race | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const nav = useNavigate();

  React.useEffect(() => {
    async function fetchNextRace() {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || getApiBase() || "https://api.jolpi.ca/ergast/f1";
        const res = await fetch(`${API_BASE}/current.json`);
        const data = await res.json();
        const races: Race[] = data?.MRData?.RaceTable?.Races || [];
        const now = new Date();

        const upcoming = races.find((r) => new Date(r.date) > now);
        if (upcoming) setNextRace(upcoming);
        else setNextRace(null);
      } catch (err) {
        console.error("⚠️ 다음 경기 불러오기 실패:", err);
        setError("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchNextRace();
  }, []);

  if (loading)
    return (
      <Card sx={{ p: 3, minHeight: 160 }}>
        <Typography>로딩 중...</Typography>
      </Card>
    );

  if (error)
    return (
      <Card sx={{ p: 3, minHeight: 160 }}>
        <Typography color="error">{error}</Typography>
      </Card>
    );

  if (!nextRace)
    return (
      <Card
        sx={{
          p: 3,
          borderRadius: 4,
          background:
            "linear-gradient(180deg,rgba(255,255,255,0.85),rgba(245,246,250,0.9))",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          다음 경기 (KST)
        </Typography>
        <Typography fontWeight={700}>🏁 시즌이 종료되었습니다.</Typography>
        <Typography color="text.secondary">
          다음 시즌 개막을 기다려주세요!
        </Typography>
      </Card>
    );

  /* 날짜 계산 */
  const utcDate = new Date(`${nextRace.date}T${nextRace.time ?? "00:00:00Z"}`);
  const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  const kstStr = kstDate.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const diffDays = Math.ceil(
    (utcDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const country = nextRace.Circuit.Location.country;
  const color = circuitColors[country] || "#DC1F26";
  const flag = countryToFlag[country] || "🏁";

  return (
    <Card
       sx={{
        borderRadius: 4,
        overflow: "hidden",
        background: `linear-gradient(145deg, #fff 0%, #f5f6fa 100%)`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        position: "relative",
        width: "100%",
        maxWidth: "none", 
        height: "100%", 
      }}
    >
      {/* 좌상단 색 포인트 바 */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 6,
          bgcolor: color,
        }}
      />

      <CardContent  
        sx={{
          p: { xs: 3, md:2 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center", 
          textAlign: "center", 
        }}>
        <Typography variant="h6" 
        sx={{
          fontWeight: 800,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 0.8, 
        }}>
        <BoltRounded sx={{ color: "#FFD100", fontSize: 24 }} />
          다음 경기 (KST)
        </Typography>

        {/* 칩 */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center", mb: 1.5, flexWrap: "wrap" }}>
          <Chip
            label={`Round ${nextRace.round}`}
            sx={{
              bgcolor: "#FFD100",
              fontWeight: 800,
              borderRadius: "10px",
              fontSize: "0.8rem",
            }}
          />
          <Chip
            label={`${flag} ${nextRace.Circuit.Location.locality}`}
            sx={{
              bgcolor: "#fff",
              border: "1px solid #eee",
              fontWeight: 700,
              borderRadius: "10px",
              fontSize: "0.8rem",
            }}
          />
          {diffDays > 0 && (
            <Chip
              label={`D-${diffDays}`}
              sx={{
                bgcolor: color,
                color: "#fff",
                fontWeight: 800,
                borderRadius: "10px",
                fontSize: "0.8rem",
                boxShadow: `0 0 8px ${color}80`,
              }}
            />
          )}
        </Stack>

        {/* 경기명 */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            mb: 0.5,
            color,
            letterSpacing: -0.3,
          }}
        >
          {nextRace.raceName}
        </Typography>

        {/* 서킷 정보 */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
          {kstStr} · {nextRace.Circuit.circuitName}
        </Typography>

        {/* 버튼 */}
        <Button
          variant="contained"
          startIcon={<BoltRounded />}
          onClick={() => nav("/schedule")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "9999px",
            background: `linear-gradient(135deg, ${color}, #ff4141)`,
            boxShadow: `0 4px 14px ${color}50`,
            "&:hover": {
              background: `linear-gradient(135deg, ${color}, #ff2222)`,
              boxShadow: `0 6px 18px ${color}70`,
            },
          }}
        >
          일정 보기
        </Button>
      </CardContent>
    </Card>
  );
}

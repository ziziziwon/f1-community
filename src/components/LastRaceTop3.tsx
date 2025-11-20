import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Box,
} from "@mui/material";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import EmojiFlagsRounded from "@mui/icons-material/EmojiFlagsRounded";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../utils/apiBase";

type DriverResult = {
  position: string;
  points: string;
  Driver: { givenName: string; familyName: string };
  Constructor: { name: string };
};

export default function LastRaceTop3() {
  const [results, setResults] = React.useState<DriverResult[]>([]);
  const [raceName, setRaceName] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [dateStr, setDateStr] = React.useState("");
  const [circuitName, setCircuitName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const nav = useNavigate();

  React.useEffect(() => {
    async function fetchLastRace() {
      try {
        // use environment override or base-aware API
        const API_BASE = import.meta.env.VITE_API_BASE || getApiBase?.() || "https://api.jolpi.ca/ergast/f1";
        const res = await fetch(`${API_BASE}/current/last/results.json`);
        const data = await res.json();
        const race = data?.MRData?.RaceTable?.Races?.[0];
        if (!race || !race.Results?.length) throw new Error("No race data");

        setRaceName(race.raceName);
        setCountry(race.Circuit.Location.country);
        setCircuitName(race.Circuit.circuitName);
        setDateStr(race.date);
        setResults(race.Results.slice(0, 3));
      } catch (err) {
        console.error("⚠️ 지난 경기 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLastRace();
  }, []);

  if (loading)
    return (
      <Card sx={{ p: 3 }}>
        <Typography>로딩 중...</Typography>
      </Card>
    );

  const flagMap: Record<string, string> = {
    USA: "🇺🇸",
    Japan: "🇯🇵",
    Mexico: "🇲🇽",
    Italy: "🇮🇹",
    "Great Britain": "🇬🇧",
  };
  const flag = flagMap[country] || "🏁";
  const color = "#001489";

  const teamColor: Record<string, string> = {
    "Red Bull": "#1E41FF",
    McLaren: "#FF8000",
    Ferrari: "#DC0000",
    Mercedes: "#00D2BE",
    "Aston Martin": "#006F62",
    Alpine: "#0090FF",
    RB: "#2B50AA",
    Haas: "#B6BABD",
    Williams: "#00A0DE",
    Sauber: "#004225",
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        background: `linear-gradient(145deg, #fff 0%, #f7f8fb 100%)`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* 상단 포인트 바 */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 6,
          bgcolor: "#FFD100",
        }}
      />

      <CardContent
        sx={{
          p: { xs: 3, md: 2 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* 제목 */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.6,
              color: "#111",
            }}
          >
            <EmojiEventsRounded sx={{ color: "#FFD100", fontSize: 24 }} />
            {flag} {raceName} Top 3
          </Typography>
          {dateStr && circuitName && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 450,
                mt: 0.5,
                letterSpacing: "-0.01em",
              }}
            >
              {dateStr} · {circuitName}
            </Typography>
          )}
        </Box>

        {/* 리스트 */}
        <Stack spacing={1} sx={{ width: "100%", maxWidth: 420, mb: 2 }}>
          {results.map((r) => {
            const pos = Number(r.position);
            const medal =
              pos === 1 ? "#FFD100" : pos === 2 ? "#C0C0C0" : "#CD7F32";
            const fam = r.Driver.familyName;
            const team = r.Constructor.name;
            const tColor = teamColor[team] || "#555";

            return (
              <Stack
                key={r.position}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Chip
                    label={`#${pos}`}
                    size="small"
                    sx={{
                      bgcolor: medal,
                      color: "#111",
                      fontWeight: 800,
                      height: 24,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: pos === 1 ? 800 : 700,
                      color: "#111",
                      fontSize: "1rem",
                    }}
                  >
                    {fam}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: tColor,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    {team}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "#111",
                      ml: 1,
                      minWidth: 36,
                      textAlign: "right",
                    }}
                  >
                    {r.points} pts
                  </Typography>
                </Stack>
              </Stack>
            );
          })}
        </Stack>

        {/* 버튼 */}
        <Button
          variant="contained"
          startIcon={<EmojiFlagsRounded />}
          onClick={() => nav("/results")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "9999px",
            px: 2.2,
            py: 1.3,
            background: `linear-gradient(135deg, ${color}, #4a63ff)`,
            boxShadow: `0 4px 14px ${color}40`,
            "&:hover": {
              background: `linear-gradient(135deg, ${color}, #3145cc)`,
              boxShadow: `0 6px 18px ${color}60`,
            },
          }}
        >
          전체보기
        </Button>
      </CardContent>
    </Card>
  );
}

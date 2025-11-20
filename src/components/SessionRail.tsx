import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import DirectionsCarFilledRounded from "@mui/icons-material/DirectionsCarFilledRounded";
import AvTimerRounded from "@mui/icons-material/AvTimerRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import { getApiBase } from "../utils/apiBase";

/* 컬러 토큰 */
const PRIMARY = "#001489"; // 네이비
const ACCENT = "#DC1F26";  // 레드
const GRAY = "#9CA3AF";    // 종료 회색

type Session = { date?: string; time?: string };
type Circuit = { circuitName?: string };
type Race = {
  season?: string;
  round?: string;
  raceName?: string;
  Circuit?: Circuit;
  date?: string;
  time?: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  Sprint?: Session;
};

const tz = "Asia/Seoul";
const parse = (d?: string, t?: string) => (d && t ? new Date(`${d}T${t}`) : undefined);
const fmt = (d?: Date) =>
  d
    ? new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: tz,
      }).format(d)
    : "-";

const API_BASE = getApiBase() || import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "https://ergast.com/api/f1";

/* 🧠 최신 라운드 자동 감지 */
async function fetchRace(): Promise<Race | null> {
  const res = await fetch(`${API_BASE}/current.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const races: Race[] = data?.MRData?.RaceTable?.Races ?? [];

  if (!races.length) return null;

  const now = Date.now();
  // 현재 이후 가장 가까운 경기 탐색
  const upcoming = races.find((r) => {
    const start = new Date(`${r.date}T${r.time}`).getTime();
    return start > now;
  });

  // 시즌 종료 시 마지막 경기로 fallback
  return upcoming ?? races[races.length - 1];
}

/* 세션 빌드 */
function buildSessions(r: Race) {
  const raw = [
    { key: "fp1", label: "FP1", s: r.FirstPractice },
    { key: "fp2", label: "FP2", s: r.SecondPractice },
    { key: "fp3", label: "FP3", s: r.ThirdPractice },
    { key: "qual", label: "Qualifying", s: r.Qualifying },
    { key: "sprint", label: "Sprint", s: r.Sprint },
    { key: "race", label: "Race", s: { date: r.date, time: r.time } },
  ];
  return raw
    .map(({ key, label, s }) => ({
      key,
      label,
      start: parse(s?.date, s?.time),
      icon:
        key === "race"
          ? <EmojiEventsRounded fontSize="small" />
          : key === "qual"
          ? <AvTimerRounded fontSize="small" />
          : <DirectionsCarFilledRounded fontSize="small" />,
    }))
    .filter((x) => !!x.start)
    .sort((a, b) => a.start!.getTime() - b.start!.getTime());
}

/* 🧩 메인 컴포넌트 */
export default function SessionRailUnified() {
  const [race, setRace] = React.useState<Race | null>(null);
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [now, setNow] = React.useState(Date.now());
  const [, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetchRace();
        if (!r) throw new Error("No race found for current season");
        setRace(r);
        setSessions(buildSessions(r));
        setErr(null);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const t0 = sessions[0]?.start?.getTime() ?? 0;
  const t1 = sessions[sessions.length - 1]?.start?.getTime() ?? 1;
  const progress = t0 && t1 ? Math.min(100, ((now - t0) / (t1 - t0)) * 100) : 0;

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
       {/* ===== 헤더 ===== */}
      <Box
        sx={{
          position: "relative",
          mb: 3,
        }}
      >
        {/*  오른쪽 상단 상태 안내 */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          {/* 안내 */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              🔵 예정
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              🔴 진행중
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              ⚪ 종료
            </Typography>
          </Stack>

          {/* 진행 바 */}
          <Box sx={{ width: 120 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 99,
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})`,
                },
              }}
            />
          </Box>

          {/* 새로고침 */}
          <Tooltip title="새로고침">
            <IconButton onClick={() => window.location.reload()} size="small">
              <RefreshRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/*  중앙 제목 */}
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          spacing={0.4}
        >
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <AvTimerRounded sx={{ color: "#FFD100", fontSize: 26 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              Weekend Sessions
            </Typography>
          </Stack>

          {race && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 450,
                color: "text.secondary",
              }}
            >
              {race.season} • Round {race.round} • {race.raceName}
            </Typography>
          )}
        </Stack>
      </Box>

        {/* ===== 타임라인 ===== */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            overflowX: "auto",
            py: 0.5,
          }}
        >
          {/* 중앙 라인 */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 0,
              right: 0,
              height: 2,
              bgcolor: "rgba(0,0,0,0.08)",
              zIndex: 0,
            }}
          />

          {sessions.map((s, i) => {
            const start = s.start!.getTime();
            const diff = start - now;
            const past = diff < 0;
            const live = Math.abs(diff) < 60 * 60 * 1000;
            let state: "예정" | "진행중" | "종료" = "예정";
            if (live) state = "진행중";
            else if (past) state = "종료";

            const color =
              state === "진행중"
                ? ACCENT
                : state === "예정"
                ? PRIMARY
                : GRAY;

            return (
              <Stack
                key={s.key}
                alignItems="center"
                spacing={0.8}
                sx={{
                  flex: 1,
                  minWidth: 110,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {i < sessions.length - 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 32,
                      left: "50%",
                      width: "100%",
                      height: 2,
                      bgcolor: past || live ? color : "rgba(0,0,0,0.08)",
                    }}
                  />
                )}

                {/* 아이콘 */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#fff",
                    border: `3px solid ${color}`,
                    color,
                    boxShadow:
                      state === "진행중"
                        ? `0 0 10px ${ACCENT}55`
                        : "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {s.icon}
                </Box>

                {/* 라벨 */}
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    color: "#111",
                  }}
                >
                  {s.label}
                </Typography>

                {/* 날짜 */}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.6)",
                    textAlign: "center",
                  }}
                >
                  {fmt(s.start)}
                </Typography>
              </Stack>
            );
          })}
        </Box>

        {err && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            {err}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

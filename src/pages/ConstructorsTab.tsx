import * as React from "react";
import { getApiBase } from "../utils/apiBase";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
} from "@mui/material";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import FlagRounded from "@mui/icons-material/FlagRounded";
import { TEAM_DATA } from "./teams";
import withAsset from "../utils/asset";

/* ─────────────── 타입 정의 ─────────────── */
type ConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: { name: string; nationality: string };
};

/* ─────────────── Ergast → TeamKey 매핑 ─────────────── */
const TEAM_NAME_MAP: Record<string, keyof typeof TEAM_DATA> = {
  "Oracle Red Bull Racing": "redbull",
  "Red Bull": "redbull",
  "Scuderia Ferrari": "ferrari",
  "Mercedes-AMG Petronas": "mercedes",
  Mercedes: "mercedes",
  McLaren: "mclaren",
  "Aston Martin": "aston",
  "Alpine": "alpine",
  "BWT Alpine F1 Team": "alpine",
  Williams: "williams",
  "Visa Cash App RB": "rb",
  "RB F1 Team": "rb",
  "Stake F1 Team Kick Sauber": "sauber",
  "Kick Sauber": "sauber",
  "sauber": "sauber",
  Haas: "haas",
  "MoneyGram Haas F1 Team": "haas",
};

/* ─────────────── 팀 이름 정규화 매칭 함수 ─────────────── */
function resolveTeamKey(nameRaw: string): keyof typeof TEAM_DATA | null {
  const name = nameRaw.toLowerCase();

  // 1️⃣ 직접 매핑 (부분 일치)
  for (const [ergastName, key] of Object.entries(TEAM_NAME_MAP)) {
    if (name.includes(ergastName.toLowerCase())) return key as keyof typeof TEAM_DATA;
  }

  // 2️⃣ 보조 매칭: apiName 으로 확인
  for (const key of Object.keys(TEAM_DATA) as (keyof typeof TEAM_DATA)[]) {
    const api = TEAM_DATA[key].apiName?.toLowerCase();
    if (api && name.includes(api)) return key;
  }

  return null;
}

/* ─────────────── 포지션 칩 스타일 ─────────────── */
function posChip(rank: number) {
  if (rank === 1) return { bg: "#FFD54F", fg: "#3d2e00", label: "#1" };
  if (rank === 2) return { bg: "#E0E0E0", fg: "#222", label: "#2" };
  if (rank === 3) return { bg: "#D7A86E", fg: "#2b1906", label: "#3" };
  return { bg: "#ECEFF1", fg: "#37474F", label: `#${rank}` };
}

/* ─────────────── 메인 컴포넌트 ─────────────── */
export default function ConstructorsTab() {
  const [season, setSeason] = React.useState<"current" | "2024" | "2023">("current");
  const [rows, setRows] = React.useState<ConstructorStanding[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const API_BASE = getApiBase();
    const endpoint =
      season === "current"
        ? `${API_BASE}/current/constructorStandings.json`
        : `${API_BASE}/${season}/constructorStandings.json`;

    setLoading(true);
    setError(null);
    setRows(null);

    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list: ConstructorStanding[] =
          data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
        setRows(list);
      })
      .catch((e) => setError(e.message || "Fetch failed"))
      .finally(() => setLoading(false));
  }, [season]);

  /* 팀 로고는 TEAM_DATA에서 제공하거나 placeholder를 사용합니다 */

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: { xs: 12, md: 8 } }}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            🏁 {season === "current" ? "현재" : season} 컨스트럭터 스탠딩
          </Typography>
          <Chip icon={<EmojiEventsRounded />} label="Ergast API" size="small" sx={{ fontWeight: 700 }} />
        </Stack>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={season} onChange={(e) => setSeason(e.target.value as any)}>
            <MenuItem value="current">Current season</MenuItem>
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* 로딩 */}
      {loading && (
        <Stack spacing={1.25}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={76} />
          ))}
        </Stack>
      )}

      {/* 에러 */}
      {!!error && (
        <Typography color="error" sx={{ mt: 2, fontWeight: 700 }}>
          데이터를 불러오지 못했습니다: {error}
        </Typography>
      )}

      {/* 본문 */}
      {!loading && !error && rows?.length && (
        <Stack spacing={1.25}>
          {rows.map((d) => {
            const rank = Number(d.position);
            const chip = posChip(rank);
            const teamName = d.Constructor.name;
            const tKey = resolveTeamKey(teamName);
            const team = tKey ? TEAM_DATA[tKey] : null;

            return (
              <Paper
                key={teamName}
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fff",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    label={chip.label}
                    size="small"
                    sx={{
                      bgcolor: chip.bg,
                      color: chip.fg,
                      fontWeight: 900,
                      minWidth: 46,
                    }}
                  />

                  {/* 팀 로고 */}
                  <Avatar
                    src={withAsset(team?.logo || "/assets/placeholders/team.svg")}
                    alt={teamName}
                    sx={{
                      width: 52,
                      height: 52,
                      border: `2px solid ${team?.color || "#ccc"}`,
                      bgcolor: "#fafafa",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = withAsset("/assets/placeholders/team.svg") || "";
                    }}
                  />

                  {/* 본문 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900 }}>{teamName}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {d.Constructor.nationality}
                      </Typography>
                      <Chip
                        icon={<BoltRounded sx={{ fontSize: 16 }} />}
                        label={`${d.points} pts`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 900,
                          ...(team && { borderColor: team.color, color: team.color }),
                        }}
                      />
                      <Chip
                        label={`${d.wins} wins`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 900 }}
                      />
                    </Stack>
                  </Box>

                  <Chip
                    icon={<FlagRounded sx={{ fontSize: 16 }} />}
                    label={d.Constructor.nationality}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}

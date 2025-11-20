import * as React from "react";
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
import { getApiBase } from "../utils/apiBase";

/* ──────────────── 2025 기준 드라이버 코드 → 슬러그 ──────────────── */
export const DRIVER_SLUG: Record<string, string> = {
  VER: "max_verstappen",
  TSU: "yuki_tsunoda",
  LEC: "charles_leclerc",
  HAM: "lewis_hamilton",
  RUS: "george_russell",
  ANT: "kimi_antonelli",
  NOR: "lando_norris",
  PIA: "oscar_piastri",
  ALO: "fernando_alonso",
  STR: "lance_stroll",
  GAS: "pierre_gasly",
  COL: "franco_colapinto",
  ALB: "alexander_albon",
  SAI: "carlos_sainz",
  LAW: "liam_lawson",
  HAD: "isack_hadjar",
  HUL: "nico_hulkenberg",
  BOR: "gabriel_bortoleto",
  OCO: "esteban_ocon",
  BEA: "oliver_bearman",
  DOO: "jack_doohan", 
};

/* 기본 실루엣 fallback (data URI) */
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
    <rect width='96' height='96' rx='48' fill='#f3f4f7'/>
    <circle cx='48' cy='38' r='16' fill='#b5bfd6'/>
    <path d='M20,84c4-16,22-22,28-22s24,6,28,22' fill='#b5bfd6'/>
  </svg>`);

/* ──────────────── 타입 ──────────────── */
type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: { givenName: string; familyName: string; code?: string; nationality: string };
  Constructors: { name: string }[];
};

/* ──────────────── 팀 매핑 ──────────────── */
const TEAM_NAME_MAP: Record<string, keyof typeof TEAM_DATA> = {
  "Oracle Red Bull Racing": "redbull",
  "Red Bull": "redbull",
  "Scuderia Ferrari": "ferrari",
  Ferrari: "ferrari",
  Mercedes: "mercedes",
  "Mercedes-AMG Petronas": "mercedes",
  McLaren: "mclaren",
  "Aston Martin": "aston",
  "Aston Martin Aramco": "aston",
  Alpine: "alpine",
  "Alpine F1 Team": "alpine",
  Williams: "williams",
  "Williams Racing": "williams",
  "Visa Cash App RB": "rb",
  "RB F1 Team": "rb",
  "Stake F1 Team Kick Sauber": "sauber",
  "Kick Sauber": "sauber",
  Haas: "haas",
  "Haas F1 Team": "haas",
};

/* 드라이버 강제 팀 매핑 (특수 시즌 전환) */
const DRIVER_FORCE_TEAM: Record<string, keyof typeof TEAM_DATA> = {
  TSU: "redbull", // 2025: Tsunoda → Red Bull
  LAW: "rb",      // 2025: Lawson → RB
};

/* 팀 키 해석 */
function resolveTeamKey(constructors: { name: string }[], driverCode?: string) {
  const raw = constructors?.[0]?.name || "";
  const name = raw.toLowerCase();

  if (driverCode && DRIVER_FORCE_TEAM[driverCode]) return DRIVER_FORCE_TEAM[driverCode];

  for (const [ergastName, key] of Object.entries(TEAM_NAME_MAP)) {
    if (name.includes(ergastName.toLowerCase())) return key as keyof typeof TEAM_DATA;
  }
  for (const key of Object.keys(TEAM_DATA) as (keyof typeof TEAM_DATA)[]) {
    const api = TEAM_DATA[key].apiName?.toLowerCase();
    if (api && name.includes(api)) return key;
  }
  return null;
}

/* 포지션 칩 색상 */
function posChip(rank: number) {
  if (rank === 1) return { bg: "#FFD54F", fg: "#3d2e00", label: "#1" };
  if (rank === 2) return { bg: "#E0E0E0", fg: "#222", label: "#2" };
  if (rank === 3) return { bg: "#D7A86E", fg: "#2b1906", label: "#3" };
  return { bg: "#ECEFF1", fg: "#37474F", label: `#${rank}` };
}

/* ──────────────── 메인 ──────────────── */
export default function DriversTab() {
  const [season, setSeason] = React.useState<"current" | "2024" | "2023">("current");
  const [rows, setRows] = React.useState<DriverStanding[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
  const API_BASE = import.meta.env.VITE_API_BASE || getApiBase() || "https://api.jolpi.ca/ergast/f1";
    const endpoint =
      season === "current"
        ? `${API_BASE}/current/driverStandings.json`
        : `${API_BASE}/${season}/driverStandings.json`;

    setLoading(true);
    setError(null);
    setRows(null);

    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list: DriverStanding[] =
          data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        setRows(list);
      })
      .catch((e) => setError(e.message || "Fetch failed"))
      .finally(() => setLoading(false));
  }, [season]);

  /* ========= 이미지 후보 구성 (CDN → 로컬 → FALLBACK) =========
     - CDN 경로는 시즌/호스트 변경에 대비해 2~3개 준비
     - 로컬 경로는 public/assets/drivers/*.png 에 있을 때만 사용됨
  */
  const imgCandidatesMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    (rows || []).forEach((d) => {
      const code = d.Driver.code || "";
      const slug = DRIVER_SLUG[code];
      const list: string[] = [];

      if (slug) {
        // 공식 F1 CDN 후보들 (https 필수)
        // 경로는 배포에 따라 바뀌기도 해서 2~3개 준비
        list.push(
          // 기존 네가 쓰던 경로
          `https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/${slug}.png`,
          // 대체(일부 시즌 구조): 슬러그 폴더 없이 파일만 있을 때
          `https://media.formula1.com/content/dam/fom-website/manual/Drivers/${slug}.png`
        );
      }

      // 로컬(옵션 B에선 보통 비워둠 / 넣어두면 자동 사용)
        if (slug) {
          const a1 = withAsset(`/assets/drivers/${slug}.png`);
          const a2 = withAsset(`/assets/drivers/${slug}.webp`);
          const a3 = withAsset(`/assets/drivers/${slug}.jpg`);
          const a4 = withAsset(`/assets/drivers/${slug}.avif`);
          if (a4) list.push(a4);
          if (a2) list.push(a2);
          if (a1) list.push(a1);
          if (a3) list.push(a3);
        }

      // 최종: FALLBACK (data URI)
      list.push(FALLBACK);

      map[code || `__${d.Driver.familyName}`] = list;
    });
    // remove any undefined candidates
    Object.keys(map).forEach((k) => {
      map[k] = (map[k] || []).filter(Boolean) as string[];
    });
    return map;
  }, [rows]);

  // 현재 시도 중인 이미지 URL
  const [imgSrcMap, setImgSrcMap] = React.useState<Record<string, string>>({});

  // rows가 바뀌면 각 드라이버의 첫 후보부터 시도
  React.useEffect(() => {
    const next: Record<string, string> = {};
    Object.entries(imgCandidatesMap).forEach(([key, arr]) => {
      next[key] = arr[0]; // 첫 번째 후보
    });
    setImgSrcMap(next);
  }, [imgCandidatesMap]);

  // onError에서 다음 후보로 진행
  const advanceCandidate = React.useCallback((key: string) => {
    const arr = imgCandidatesMap[key] || [];
    const current = imgSrcMap[key];
    const idx = arr.indexOf(current);
    const next = arr[idx + 1]; // 다음 후보
    setImgSrcMap((prev) => ({ ...prev, [key]: next || FALLBACK }));
  }, [imgCandidatesMap, imgSrcMap]);

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: { xs: 12, md: 8 } }}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            🏎️ {season === "current" ? "현재" : season} 드라이버 스탠딩
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
            const codeKey = d.Driver.code || `__${d.Driver.familyName}`; // 안전 키
            const tKey = resolveTeamKey(d.Constructors, d.Driver.code);
            const team = tKey ? TEAM_DATA[tKey] : null;
            const currentSrc = imgSrcMap[codeKey] || FALLBACK;

            return (
              <Paper
                key={`${d.Driver.familyName}-${d.Driver.code ?? ""}`}
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fff",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {/* 포지션 */}
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

                  {/* 얼굴 (중요: Avatar는 imgProps로 onError를 건다) */}
                  <Avatar
                    src={currentSrc}
                    alt={d.Driver.familyName}
                    imgProps={{
                      // 이미지 로드 실패 시 다음 후보로
                      onError: () => advanceCandidate(codeKey),
                      // 일부 CDN이 리퍼러 제한 시 완화용
                      referrerPolicy: "no-referrer",
                    }}
                    sx={{
                      width: 52,
                      height: 52,
                      border: `2px solid ${team?.color || "#ccc"}`,
                      bgcolor: "#fafafa",
                      "& img": { objectFit: "cover" },
                    }}
                  >
                    {d.Driver.code ?? "?"}
                  </Avatar>

                  {/* 본문 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900 }}>
                      {d.Driver.givenName} {d.Driver.familyName}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {team?.name ?? d.Constructors?.[0]?.name ?? "—"}
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
                      <Chip label={`${d.wins} wins`} size="small" variant="outlined" sx={{ fontWeight: 900 }} />
                    </Stack>
                  </Box>

                  {/* 국기 */}
                  <Chip
                    icon={<FlagRounded sx={{ fontSize: 16 }} />}
                    label={d.Driver.nationality}
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

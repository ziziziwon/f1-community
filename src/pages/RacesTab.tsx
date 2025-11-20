import * as React from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  Divider,
} from "@mui/material";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import FlagRounded from "@mui/icons-material/FlagRounded";
import { TEAM_DATA } from "./teams";
import withAsset from "../utils/asset";
import { getApiBase } from "../utils/apiBase";

/* ─────────────── 타입 정의 ─────────────── */
type RaceResult = {
  raceName: string;
  round: string;
  date: string;
  Results: {
    position: string;
    points: string;
    Driver: { givenName: string; familyName: string; code?: string };
    Constructor: { name: string };
  }[];
};

/* ─────────────── 2025 드라이버 코드 → 파일 슬러그 ─────────────── */
const DRIVER_SLUG: Record<string, string> = {
  VER: "max_verstappen",
  PER: "sergio_perez",
  LEC: "charles_leclerc",
  HAM: "lewis_hamilton",
  RUS: "george_russell",
  NOR: "lando_norris",
  PIA: "oscar_piastri",
  ALO: "fernando_alonso",
  STR: "lance_stroll",
  GAS: "pierre_gasly",
  OCO: "esteban_ocon",
  COL: "franco_colapinto",
  ALB: "alexander_albon",
  SAI: "carlos_sainz",
  TSU: "yuki_tsunoda",
  LAW: "liam_lawson",
  HAD: "isack_hadjar",
  HUL: "nico_hulkenberg",
  BEA: "oliver_bearman",
  ANT: "kimi_antonelli",
  BOR: "gabriel_bortoleto",
};

/* 기본 실루엣 fallback (data URI) */
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
      <rect width='96' height='96' rx='48' fill='#f3f4f7'/>
      <circle cx='48' cy='38' r='16' fill='#b5bfd6'/>
      <path d='M20,84c4-16,22-22,28-22s24,6,28,22' fill='#b5bfd6'/>
    </svg>`
  );

/* ─────────────── TEAM 매핑 ─────────────── */
const TEAM_NAME_MAP: Record<string, keyof typeof TEAM_DATA> = {
  "Oracle Red Bull Racing": "redbull",
  "Red Bull": "redbull",
  "Scuderia Ferrari": "ferrari",
  "Mercedes-AMG Petronas": "mercedes",
  Mercedes: "mercedes",
  McLaren: "mclaren",
  "Aston Martin": "aston",
  "BWT Alpine F1 Team": "alpine",
  Alpine: "alpine",
  Williams: "williams",
  "Visa Cash App RB": "rb",
  "RB F1 Team": "rb",
  "Stake F1 Team Kick Sauber": "sauber",
  "Kick Sauber": "sauber",
  Haas: "haas",
  "MoneyGram Haas F1 Team": "haas",
};

function resolveTeamKey(nameRaw: string): keyof typeof TEAM_DATA | null {
  const name = nameRaw.toLowerCase();
  for (const [ergastName, key] of Object.entries(TEAM_NAME_MAP)) {
    if (name.includes(ergastName.toLowerCase())) return key as keyof typeof TEAM_DATA;
  }
  for (const key of Object.keys(TEAM_DATA) as (keyof typeof TEAM_DATA)[]) {
    const api = TEAM_DATA[key].apiName?.toLowerCase();
    if (api && name.includes(api)) return key;
  }
  return null;
}

/* ─────────────── 드라이버 아바타 (후보 소스 순차 시도) ─────────────── */
function DriverAvatar({
  code,
  name,
  borderColor,
  size = 44,
}: {
  code?: string;
  name: string;
  borderColor: string;
  size?: number;
}) {
  const slug = code ? DRIVER_SLUG[code] : undefined;

  // 후보: 로컬(avif/webp/png/jpg) → F1 CDN 2종 → FALLBACK
  const candidates = React.useMemo(() => {
    const list: string[] = [];
    if (slug) {
      const aAvif = withAsset(`/assets/drivers/${slug}.avif`);
      const aWebp = withAsset(`/assets/drivers/${slug}.webp`);
      const aPng = withAsset(`/assets/drivers/${slug}.png`);
      const aJpg = withAsset(`/assets/drivers/${slug}.jpg`);
      if (aAvif) list.push(aAvif);
      if (aWebp) list.push(aWebp);
      if (aPng) list.push(aPng);
      if (aJpg) list.push(aJpg);

      list.push(`https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/${slug}.png`);
      list.push(`https://media.formula1.com/content/dam/fom-website/manual/Drivers/${slug}.png`);
    }
    list.push(FALLBACK);
    return list;
  }, [slug]);

  const [srcIdx, setSrcIdx] = React.useState(0);
  const src = candidates[srcIdx];

  return (
    <Avatar
      src={src}
      alt={name}
      imgProps={{
        onError: () => setSrcIdx((i) => Math.min(i + 1, candidates.length - 1)),
        referrerPolicy: "no-referrer",
      }}
      sx={{
        width: size,
        height: size,
        fontWeight: 700,
        bgcolor: borderColor + "15",
        color: borderColor,
        border: `2px solid ${borderColor}`,
        "& img": { objectFit: "cover" },
      }}
    >
      {/* 이미지 전부 실패 시 */}
      {code ?? "?"}
    </Avatar>
  );
}

/* ─────────────── 메인 ─────────────── */
export default function RaceResultsTab() {
  const [races, setRaces] = React.useState<RaceResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
  const API_BASE = import.meta.env.VITE_API_BASE || getApiBase() || "https://api.jolpi.ca/ergast/f1";
  const endpoint = `${API_BASE}/2024/results/1.json`; // 🏁 2024 시즌 결과

    setLoading(true);
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list: RaceResult[] = data?.MRData?.RaceTable?.Races || [];
        setRaces(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="md" sx={{ pt: 3, pb: { xs: 12, md: 8 } }}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            🏁 2024 시즌 레이스 결과
          </Typography>
          <Chip icon={<EmojiEventsRounded />} label="Ergast API" size="small" sx={{ fontWeight: 700 }} />
        </Stack>
      </Stack>

      {/* 로딩 */}
      {loading && (
        <Stack spacing={1.25}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={76} />
          ))}
        </Stack>
      )}

      {/* 에러 */}
      {!!error && (
        <Typography color="error" sx={{ mt: 2, fontWeight: 700 }}>
          ❌ 데이터를 불러오지 못했습니다: {error}
        </Typography>
      )}

      {/* 본문 */}
      {!loading && !error && races.length > 0 && (
        <Stack spacing={2}>
          {races.map((race) => {
            const top3 = race.Results.slice(0, 3);
            return (
              <Paper
                key={race.round}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fff",
                }}
              >
                {/* 레이스 제목 */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: "1.05rem" }}>
                    {race.round}. {race.raceName}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <FlagRounded sx={{ fontSize: 18, opacity: 0.7 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {race.date}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />

                {/* 상위 3명 */}
                <Stack spacing={1.25}>
                  {top3.map((res) => {
                    const rank = Number(res.position);
                    const tKey = resolveTeamKey(res.Constructor.name);
                    const team = tKey ? TEAM_DATA[tKey] : null;
                    const teamColor = team?.color || "#999";

                    const medal =
                      rank === 1
                        ? { bg: "#FFD54F", fg: "#3d2e00" }
                        : rank === 2
                        ? { bg: "#E0E0E0", fg: "#333" }
                        : { bg: "#D7A86E", fg: "#2b1906" };

                    const fullName = `${res.Driver.givenName} ${res.Driver.familyName}`;

                    return (
                      <Stack key={`${race.round}-${res.position}`} direction="row" spacing={1.5} alignItems="center">
                        {/* 순위 칩 */}
                        <Chip
                          label={`#${rank}`}
                          size="small"
                          sx={{ bgcolor: medal.bg, color: medal.fg, fontWeight: 900, minWidth: 46 }}
                        />

                        {/* 드라이버 아바타 (이미지 자동 시도) */}
                        <DriverAvatar
                          code={res.Driver.code}
                          name={fullName}
                          borderColor={teamColor}
                          size={44}
                        />

                        {/* 이름 + 팀 */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                            {fullName}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: teamColor }}
                          >
                            {res.Constructor.name}
                          </Typography>
                        </Box>

                        {/* 점수 */}
                        <Chip
                          icon={<BoltRounded sx={{ fontSize: 16 }} />}
                          label={`${res.points} pts`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 900, ml: "auto", borderColor: teamColor, color: teamColor }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}

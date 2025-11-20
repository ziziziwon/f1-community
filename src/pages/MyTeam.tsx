// src/pages/MyTeam.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Alert,
  Button,
  Skeleton,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../stores/settings";
import { useAuth } from "../stores/auth";
import { TEAM_DATA } from "./teams";
import withAsset from "../utils/asset";
import { getApiBase } from "../utils/apiBase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

/* ===== 타입 ===== */
type ConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string };
};

type ErgastDriver = {
  driverId: string;
  givenName: string;
  familyName: string;
  permanentNumber?: string;
  nationality?: string;
};

type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: { driverId: string };
};

/* ===== TEAM_DATA에서 로컬 드라이버 타입 추출 ===== */
type LocalDriver = (typeof TEAM_DATA)[keyof typeof TEAM_DATA]["drivers"][number];

/* ===== 상수 ===== */
const API = import.meta.env.VITE_API_BASE || getApiBase() || "https://api.jolpi.ca/ergast/f1";

/** 우리 앱의 팀키 → Ergast constructorId */
const CONSTRUCTOR_ID_MAP: Record<string, string> = {
  redbull: "red_bull",
  ferrari: "ferrari",
  mercedes: "mercedes",
  mclaren: "mclaren",
  aston: "aston_martin",
  alpine: "alpine",
  williams: "williams",
  rb: "rb",
  sauber: "sauber",
  haas: "haas",
};

/** 팀명 매칭(시즌/스폰서 바뀌어도 견고하게) */
const TEAM_ALIAS: Record<string, string[]> = {
  redbull: ["red bull", "oracle red bull racing", "redbull"],
  ferrari: ["ferrari", "scuderia ferrari"],
  mercedes: ["mercedes", "mercedes-amg", "mercedes-amg petronas"],
  mclaren: ["mclaren", "mclaren f1 team"],
  aston: ["aston martin", "aston martin aramco"],
  alpine: ["alpine", "bwt alpine"],
  williams: ["williams", "williams racing"],
  rb: ["rb", "visa cash app rb", "racing bulls"],
  sauber: ["sauber", "kick sauber", "stake f1 team sauber"],
  haas: ["haas", "haas f1 team"],
};

/* 문자열 정규화 */
const norm = (s: string | undefined): string =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // 악센트 제거
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function isTeamMatch(favoriteKey: string, targetName: string, team?: any) {
  const t = norm(targetName);
  const aliases = new Set<string>(
    [
      ...((TEAM_ALIAS[favoriteKey] || []).map(norm)),
      norm(team?.apiName),
      norm(team?.name),
    ].filter(Boolean as any)
  );
  for (const a of aliases) {
    if (!a) continue;
    if (t.includes(a) || a.includes(t)) return true;
  }
  return false;
}

/* ===== 뷰 모델 ===== */
type DriverVM = {
  key: string;
  name: string;
  img?: string;
  number?: number;
  nation?: string;
  points: number;
  position: number;
  wins: number;
  recentResults: string[];
  progress?: { round: number; points: number }[];
};

export default function MyTeam() {
  const { favoriteTeam } = useSettings();
  const team = favoriteTeam
    ? TEAM_DATA[favoriteTeam as keyof typeof TEAM_DATA]
    : undefined;
  const { user } = useAuth();

  const [chartData, setChartData] = useState<{ round: number; points: number }[]>(
    []
  );
  const [season, setSeason] = useState<string>("");
  const [latestRound, setLatestRound] = useState<number | null>(null);
  const [kpi, setKpi] = useState<{ position?: number; points?: number; wins?: number }>(
    {}
  );

  const [drivers, setDrivers] = useState<DriverVM[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compare 상태
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");

  const mainColor = team?.color ?? "#FFD100";

  const refetchAll = useCallback(() => {
    setError(null);
    setLoadingChart(true);
    setLoadingDrivers(true);
    setChartData([]);
    setDrivers([]);
    setKpi({});
  }, []);

  /* ===== Constructor Standings ===== */
  useEffect(() => {
    let abort = false;

    async function fetchConstructorData() {
      if (!team || !favoriteTeam) {
        setChartData([]);
        setLatestRound(null);
        setSeason("");
        setKpi({});
        setLoadingChart(false);
        return;
      }
      try {
        setLoadingChart(true);

        // 최신 라운드/시즌
        const lastRes = await fetch(`${API}/current/last.json`);
        if (!lastRes.ok) throw new Error(`HTTP ${lastRes.status}`);
        const lastJson = await lastRes.json();
        const lastRound = Number(lastJson?.MRData?.RaceTable?.Races?.[0]?.round || 0);
        const ssn = String(
          lastJson?.MRData?.RaceTable?.Races?.[0]?.season || new Date().getFullYear()
        );
        if (abort) return;

        setSeason(ssn);
        setLatestRound(lastRound);

        // 라운드별 누적 포인트
        const rounds = Array.from({ length: lastRound }, (_, i) => i + 1);
        const perRoundPromises = rounds.map(async (r) => {
          const res = await fetch(`${API}/${ssn}/${r}/constructorStandings.json`);
          const j = await res.json();
          const standings: ConstructorStanding[] =
            j?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
          const found = standings.find((c) =>
            isTeamMatch(favoriteTeam, c?.Constructor?.name || "", team)
          );
          return { round: r, points: found ? Number(found.points) : 0 };
        });

        const chart = await Promise.all(perRoundPromises);
        if (abort) return;
        setChartData(chart);

        // 최신 KPI
        const latestRes = await fetch(
          `${API}/current/constructorStandings.json?limit=30`
        );
        const latestJson = await latestRes.json();
        const latestList: ConstructorStanding[] =
          latestJson?.MRData?.StandingsTable?.StandingsLists?.[0]
            ?.ConstructorStandings ?? [];
        const k = latestList.find((c) =>
          isTeamMatch(favoriteTeam, c?.Constructor?.name || "", team)
        );
        if (k) {
          setKpi({
            position: Number(k.position),
            points: Number(k.points),
            wins: Number(k.wins),
          });
        } else {
          setKpi({});
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Constructor 데이터 로딩 실패");
      } finally {
        if (!abort) setLoadingChart(false);
      }
    }

    fetchConstructorData();
    return () => {
      abort = true;
    };
  }, [team, favoriteTeam]);

  /* ===== Drivers + Standings + Recent Results =====
     카드 렌더는 TEAM_DATA.drivers(로컬) 기준으로 하고,
     지표(pts/pos/wins, 최근 3전)는 Ergast에서 매칭해 주입.
  */
  useEffect(() => {
    let abort = false;

    const fullName = (d: ErgastDriver) => `${d.givenName} ${d.familyName}`;

    const buildStandingsIndex = (list: DriverStanding[]) => {
      const idx: Record<
        string,
        { points: number; position: number; wins: number; driverId?: string }
      > = {};
      list.forEach((s) => {
        const id = s.Driver.driverId;
        idx[id] = {
          points: Number(s.points),
          position: Number(s.position),
          wins: Number(s.wins),
          driverId: id,
        };
      });
      return idx;
    };

    async function fetchDrivers() {
      if (!favoriteTeam || !team) {
        setDrivers([]);
        setLoadingDrivers(false);
        return;
      }
      try {
        setLoadingDrivers(true);

        const constructorId = CONSTRUCTOR_ID_MAP[favoriteTeam] ?? favoriteTeam;

        const [driversRes, standingsRes] = await Promise.all([
          fetch(`${API}/current/constructors/${constructorId}/drivers.json`),
          fetch(`${API}/current/driverStandings.json?limit=100`),
        ]);
        if (!driversRes.ok) throw new Error(`HTTP ${driversRes.status}`);
        if (!standingsRes.ok) throw new Error(`HTTP ${standingsRes.status}`);

        const driversJson = await driversRes.json();
        const standingsJson = await standingsRes.json();

        const apiDrivers: ErgastDriver[] =
          driversJson?.MRData?.DriverTable?.Drivers ?? [];

        const latestStandings: DriverStanding[] =
          standingsJson?.MRData?.StandingsTable?.StandingsLists?.[0]
            ?.DriverStandings ?? [];

        const standingsIdx = buildStandingsIndex(latestStandings);

        // 최근 3전 결과 (driverId → string[])
        const recentPromises = apiDrivers.map(async (d) => {
          try {
            const r = await fetch(
              `${API}/current/drivers/${d.driverId}/results.json?limit=3`
            );
            const j = await r.json();
            const arr =
              j?.MRData?.RaceTable?.Races?.slice(-3)?.map(
                (race: any) => race?.Results?.[0]?.positionText || "-"
              ) || [];
            return { id: d.driverId, results: arr.reverse() };
          } catch {
            return { id: d.driverId, results: [] as string[] };
          }
        });

        const recent = await Promise.all(recentPromises);
        const recentById = Object.fromEntries(recent.map((r) => [r.id, r.results]));

        // 이름 → driverId 맵 (로컬 로스터와 이름 매칭용)
        const apiNameToId: Record<string, string> = {};
        apiDrivers.forEach((d) => {
          apiNameToId[norm(fullName(d))] = d.driverId;
        });

        // ✅ 최종 드라이버 목록은 "로컬 로스터" 기준으로 생성
        const roster: LocalDriver[] = (team?.drivers ?? []) as LocalDriver[];

        const finalDrivers: DriverVM[] = roster.map((loc) => {
          const locKey = norm(loc.name);
          const driverId = apiNameToId[locKey]; // 이름 매칭되면 driverId 획득
          const stat = driverId ? standingsIdx[driverId] : undefined;

          return {
            key: driverId || `local-${loc.name}`,
            name: loc.name,
            img: loc.img, // 사진/번호/국적은 로컬 고정
            number: loc.number,
            nation: loc.nation,
            points: stat?.points ?? 0, // 지표는 API 주입
            position: stat?.position ?? 0,
            wins: stat?.wins ?? 0,
            recentResults: driverId ? recentById[driverId] || [] : [],
            progress: [
              { round: 1, points: 0 },
              { round: 2, points: stat?.points ?? 0 },
            ],
          };
        });

        if (abort) return;
        setDrivers(finalDrivers);
      } catch (e: any) {
        console.error(e);
        if (!abort) {
          // API 실패 시에도 로컬 로스터만으로 렌더
          const local =
            (team?.drivers as LocalDriver[] | undefined)?.map((d) => ({
              key: `local-${d.name}`,
              name: d.name,
              img: d.img,
              number: d.number,
              nation: d.nation,
              points: 0,
              position: 0,
              wins: 0,
              recentResults: [],
              progress: [
                { round: 1, points: 0 },
                { round: 2, points: 0 },
              ],
            })) || [];
          setDrivers(local);
        }
      } finally {
        if (!abort) setLoadingDrivers(false);
      }
    }

    fetchDrivers();
    return () => {
      abort = true;
    };
  }, [favoriteTeam, team]);

  /* ===== 기본 비교 대상: 포인트 상위 2명 ===== */
  const top2 = useMemo(() => {
    if (!drivers || drivers.length < 2) return [];
    return [...drivers].sort((a, b) => b.points - a.points).slice(0, 2);
  }, [drivers]);

  // 모달 열릴 때 기본 선택 세팅
  useEffect(() => {
    if (compareOpen) {
      if (top2.length >= 2) {
        setSelectedA(top2[0].key);
        setSelectedB(top2[1].key);
      } else {
        setSelectedA("");
        setSelectedB("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareOpen]);

  // 선택된 두 명
  const selectedDrivers = useMemo(() => {
    const a = drivers.find((d) => d.key === selectedA);
    const b = drivers.find((d) => d.key === selectedB);
    return a && b && a.key !== b.key ? [a, b] : [];
  }, [drivers, selectedA, selectedB]);

  /* ===== Compare 차트 데이터 ===== */
  const compareData = useMemo(() => {
    if (selectedDrivers.length < 2) return [];
    const [a, b] = selectedDrivers;
    return [
      { metric: "Points", [a.name]: a.points, [b.name]: b.points },
      { metric: "Wins", [a.name]: a.wins, [b.name]: b.wins },
      { metric: "Rank (higher is better)", [a.name]: 21 - a.position, [b.name]: 21 - b.position },
    ];
  }, [selectedDrivers]);

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 160px)",
          display: "grid",
          placeItems: "center",
          background: "radial-gradient(circle at 50% 40%, #f5f7fa 0%, #e9ecf4 100%)",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          로그인 후 팀 정보를 확인할 수 있습니다.
        </Typography>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 160px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 40%, #f5f7fa 0%, #e9ecf4 100%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h5">⚙️ 설정에서 팀을 먼저 선택해주세요</Typography>
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={favoriteTeam}
        initial={{ opacity: 0, filter: "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(6px)" }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            minHeight: "100vh",
            p: 4,
            pb: "calc(80px + 16px)",
            background: team.gradient,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* 로고/타이틀 */}
          <motion.img
            src={withAsset(team.logo)}
            alt={team.name}
            width={100}
            height={100}
            style={{
              borderRadius: "50%",
              marginBottom: 12,
              boxShadow: "0 0 24px rgba(255,255,255,0.35)",
              objectFit: "contain",
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          <Typography variant="h3" sx={{ fontWeight: 900 }}>
            {team.name}
          </Typography>

          <Typography
            sx={{
              opacity: 0.9,
              mb: 2,
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span>{team.slogan}</span>
            {season && latestRound && (
              <span style={{ opacity: 0.9 }}>
                • {season} Season · Round {latestRound}
              </span>
            )}
          </Typography>

          {/* KPI */}
          {(kpi.position || kpi.points || kpi.wins) && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 4, flexWrap: "wrap", justifyContent: "center" }}
            >
              <Chip
                size="small"
                label={`Constructor P${kpi.position ?? "-"}`}
                sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 800 }}
              />
              <Chip
                size="small"
                label={`${kpi.points ?? 0} pts`}
                sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 800 }}
              />
              <Chip
                size="small"
                label={`${kpi.wins ?? 0} wins`}
                sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 800 }}
              />
            </Stack>
          )}

          {/* 에러 */}
          {!!error && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                maxWidth: 880,
                mb: 2,
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#fff",
              }}
              action={
                <Button color="inherit" size="small" onClick={refetchAll}>
                  다시시도
                </Button>
              }
            >
              데이터를 불러오지 못했습니다: {error}
            </Alert>
          )}

          {/* 그래프 */}
          {loadingChart ? (
            <Skeleton
              variant="rounded"
              height={340}
              sx={{
                width: "100%",
                maxWidth: 880,
                mb: 8,
                bgcolor: "rgba(255,255,255,0.18)",
              }}
            />
          ) : chartData.length > 0 ? (
            <Paper
              sx={{
                width: "100%",
                maxWidth: 880,
                p: 3,
                borderRadius: 4,
                background: "rgba(255,255,255,0.12)",
                mb: 8,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              elevation={0}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>
                  🏁 Season Progress — Constructor Points
                </Typography>
                <Chip
                  size="small"
                  label={team.name}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <Box sx={{ display: "grid", placeItems: "center" }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.12)" />
                    <XAxis
                      dataKey="round"
                      stroke="#fff"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Round",
                        position: "insideBottomRight",
                        offset: -5,
                        fill: "#fff",
                      }}
                    />
                    <YAxis
                      stroke="#fff"
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Points",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#fff",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.85)",
                        borderRadius: 8,
                        color: "#fff",
                        border: "none",
                      }}
                      labelStyle={{ color: "#FFD100" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke={mainColor}
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#fff" }}
                      activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: mainColor }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          ) : null}

          {/* 드라이버 카드 */}
          {loadingDrivers ? (
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              justifyContent="center"
              sx={{ pb: 6 }}
            >
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={190}
                  width={240}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.18)",
                    borderRadius: 2,
                  }}
                />
              ))}
            </Stack>
          ) : drivers.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 24,
                pb: 6,
                width: "100%",
              }}
            >
              {drivers.map((d) => (
                <motion.div
                  key={d.key}
                  whileHover={{ y: -6, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 160 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      width: 260,
                      borderRadius: 4,
                      textAlign: "center",
                      background: "rgba(255,255,255,0.14)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${withAsset(team.logo)})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "60%",
                        opacity: 0.05,
                        pointerEvents: "none",
                      }}
                    />
                    <img
                      src={withAsset(d.img)}
                      alt={d.name}
                      style={{
                        width: 92,
                        height: 92,
                        borderRadius: "50%",
                        marginBottom: 10,
                        border: "2px solid rgba(255,255,255,0.45)",
                        objectFit: "cover",
                        display: d.img ? "block" : "none",
                        position: "relative",
                        zIndex: 1,
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {d.name}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {d.nation || "🌍"} &nbsp; {d.number ? `#${d.number}` : ""}
                    </Typography>

                    <Box sx={{ width: "100%", height: 50, mt: 1.25 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={d.progress || [{ round: 1, points: 0 }]}>
                          <Line type="monotone" dataKey="points" stroke="#fff" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{ mt: 1 }}
                    >
                      <Chip
                        size="small"
                        label={`P${d.position || "-"}`}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.18)",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${d.points ?? 0} pts`}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.18)",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${d.wins ?? 0} wins`}
                        sx={{
                          bgcolor: "rgba(255,255,255,0.18)",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      />
                    </Stack>

                    {d.recentResults?.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                        sx={{ mt: 1.5 }}
                      >
                        {d.recentResults.map((r, i) => {
                          const color =
                            r === "1"
                              ? "#FFD700"
                              : r === "2"
                              ? "#C0C0C0"
                              : r === "3"
                              ? "#CD7F32"
                              : "rgba(255,255,255,0.18)";
                          return (
                            <Chip
                              key={i}
                              size="small"
                              label={r}
                              sx={{
                                bgcolor: color,
                                color:
                                  r === "1" || r === "2" || r === "3"
                                    ? "#000"
                                    : "#fff",
                                fontWeight: 700,
                                fontSize: "0.7rem",
                                minWidth: 26,
                                height: 22,
                              }}
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </Paper>
                </motion.div>
              ))}
            </Box>
          ) : (
            <Typography sx={{ opacity: 0.9, pb: 6 }}>
              표시할 드라이버 정보가 없습니다.
            </Typography>
          )}

          {/* Compare 버튼: 2명 이상이면 노출 */}
          {drivers.length >= 2 && (
            <Button
              onClick={() => setCompareOpen(true)}
              sx={{
                position: "relative",
                zIndex: 10,
                mt: 2,
                bgcolor: "#fff",
                color: "#000",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: 4,
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                "&:hover": { bgcolor: "#eee" },
              }}
            >
              Compare 🔁
            </Button>
          )}
        </Box>

        {/* 비교 모달 */}
        <Modal open={compareOpen} onClose={() => setCompareOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#121212",
              color: "#fff",
              p: 4,
              borderRadius: 3,
              width: "min(680px, 92%)",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 900 }}>
              ⚔️ Driver Comparison
            </Typography>

            {/* 드라이버 선택 영역 */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="select-driver-a" sx={{ color: "#fff" }}>
                  Driver A
                </InputLabel>
                <Select
                  labelId="select-driver-a"
                  value={selectedA}
                  label="Driver A"
                  onChange={(e) => setSelectedA(e.target.value)}
                  sx={{ color: "#fff", ".MuiSvgIcon-root": { color: "#fff" } }}
                >
                  {drivers.map((d) => (
                    <MenuItem
                      key={d.key}
                      value={d.key}
                      disabled={d.key === selectedB}
                    >
                      {d.name} {d.number ? `(#${d.number})` : ""} · {d.points}pts
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="select-driver-b" sx={{ color: "#fff" }}>
                  Driver B
                </InputLabel>
                <Select
                  labelId="select-driver-b"
                  value={selectedB}
                  label="Driver B"
                  onChange={(e) => setSelectedB(e.target.value)}
                  sx={{ color: "#fff", ".MuiSvgIcon-root": { color: "#fff" } }}
                >
                  {drivers.map((d) => (
                    <MenuItem
                      key={d.key}
                      value={d.key}
                      disabled={d.key === selectedA}
                    >
                      {d.name} {d.number ? `(#${d.number})` : ""} · {d.points}pts
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* 스왑 & 리셋 버튼 */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                onClick={() => {
                  setSelectedA(selectedB);
                  setSelectedB(selectedA);
                }}
                sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "rgba(255,255,255,0.24)" } }}
              >
                Swap ↔
              </Button>
              <Button
                onClick={() => {
                  if (top2.length >= 2) {
                    setSelectedA(top2[0].key);
                    setSelectedB(top2[1].key);
                  } else {
                    setSelectedA("");
                    setSelectedB("");
                  }
                }}
                sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "rgba(255,255,255,0.24)" } }}
              >
                Top 2로 초기화
              </Button>
            </Stack>

            {/* 비교 차트 */}
            <Box
              sx={{
                opacity: selectedDrivers.length < 2 ? 0.5 : 1,
                pointerEvents: selectedDrivers.length < 2 ? "none" : "auto",
              }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={compareData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="metric"
                    stroke="#fff"
                    width={180}
                    tick={{ fill: "#fff" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                  {selectedDrivers.map((d, i) => (
                    <Bar
                      key={d.key}
                      dataKey={d.name}
                      fill={i === 0 ? mainColor : "#fff"}
                      barSize={24}
                      radius={[4, 4, 4, 4]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>

              {selectedDrivers.length < 2 && (
                <Typography sx={{ mt: 1.5, opacity: 0.8, textAlign: "center" }}>
                  비교할 두 명을 선택하세요.
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              sx={{ mt: 3, bgcolor: "#fff", color: "#000", fontWeight: 700 }}
              onClick={() => setCompareOpen(false)}
            >
              닫기
            </Button>
          </Box>
        </Modal>
      </motion.div>
    </AnimatePresence>
  );
}

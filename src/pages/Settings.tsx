// src/pages/Settings.tsx
import * as React from "react";
import { useSettings } from "../stores/settings";
import { useNavigate } from "react-router-dom";
import {
  Container, Box, Stack, Typography, Paper, Divider, TextField, MenuItem,
  FormControlLabel, Switch, Button, Chip, Tooltip, Avatar, Snackbar, Alert
} from "@mui/material";

import TuneRounded from "@mui/icons-material/TuneRounded";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import ThumbUpAltRounded from "@mui/icons-material/ThumbUpAltRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";

import { useAuth } from "../stores/auth";
import withAsset from "../utils/asset";
import LoginDialog from "../components/LoginDialog";
import { TEAM_DATA } from "./teams"; //  팀 로고/컬러 사용

/* ───────────────── Tokens ───────────────── */
const G = 1.25; // 내부 요소 간 기본 간격 단위
const R = 2;    // 카드 라운드
const CARD = {
  borderRadius: R,
  borderColor: "divider",
  boxShadow: "0 4px 18px rgba(10,15,28,.06)",
  bgcolor: "#fff",
} as const;

// Red Bull palette
const RB_NAVY = "#001489";
const RB_YELLOW = "#FFD100";

/* ───────────────── Data ───────────────── */
const TEAMS = [
  { id: "redbull", label: "Oracle Red Bull Racing" },
  { id: "ferrari", label: "Scuderia Ferrari" },
  { id: "mercedes", label: "Mercedes-AMG" },
  { id: "mclaren", label: "McLaren" },
  { id: "aston", label: "Aston Martin" },
  { id: "alpine", label: "Alpine" },
  { id: "williams", label: "Williams" },
  { id: "rb", label: "Visa Cash App RB" },
  { id: "sauber", label: "Stake F1 Team Sauber" },
  { id: "haas", label: "Haas F1 Team" },
] as const;

/* ───────────── 통계/배지 헬퍼 ───────────── */
type Stats = { posts: number; commentsOnPosts: number; likesOnPosts: number };
function getStats(userId: string): Stats {
  if (!userId) return { posts: 0, commentsOnPosts: 0, likesOnPosts: 0 };
  try {
    const raw = localStorage.getItem("apex-forum-threads");
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return { posts: 0, commentsOnPosts: 0, likesOnPosts: 0 };
    const mine = arr.filter((t) => (t?.authorId ?? "").toLowerCase() === userId);
    const posts = mine.length;
    const commentsOnPosts = mine.reduce(
      (a, t) => a + (Array.isArray(t?.comments) ? t.comments.length : 0), 0
    );
    const likesOnPosts = mine.reduce((a, t) => a + (Number(t?.likes) || 0), 0);
    return { posts, commentsOnPosts, likesOnPosts };
  } catch {
    return { posts: 0, commentsOnPosts: 0, likesOnPosts: 0 };
  }
}

type Badge = {
  id: string;
  label: string;
  tip: string;
  achieved: boolean;
  icon: React.ReactElement;
};
function buildBadges(stats: Stats): Badge[] {
  return [
    {
      id: "first-post",
      label: "첫 글",
      tip: "첫 글을 작성했어요",
      achieved: stats.posts >= 1,
      icon: <EmojiEventsRounded fontSize="small" />,
    },
    {
      id: "talkative",
      label: "활발한 토론",
      tip: "댓글 10개 이상",
      achieved: stats.commentsOnPosts >= 10,
      icon: <ChatBubbleOutlineRounded fontSize="small" />,
    },
    {
      id: "popular",
      label: "인기 글",
      tip: "좋아요 20개 이상",
      achieved: stats.likesOnPosts >= 20,
      icon: <ThumbUpAltRounded fontSize="small" />,
    },
    {
      id: "shutterbug",
      label: "포토러버",
      tip: "갤러리에 사진을 올려보세요",
      achieved: false, // 갤러리 연동 시 갱신
      icon: <PhotoCameraRounded fontSize="small" />,
    },
  ];
}

/* ───────────── 공통 섹션 카드 ───────────── */
function Section({
  title, icon, children, hint, sx,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
  sx?: any;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ ...CARD, display: "flex", flexDirection: "column", height: "100%", ...sx }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5 }}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{title}</Typography>
      </Stack>
      <Divider />
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, pt: 1 }}>
          {hint}
        </Typography>
      )}
      <Box sx={{ p: 2, pt: 1.25, flexGrow: 1, display: "flex" }}>
        <Box sx={{ maxWidth: 560, width: "100%" }}>{children}</Box>
      </Box>
    </Paper>
  );
}

/* ───────────── 페이지 ───────────── */
export default function Settings() {
  const user = useAuth((s) => s.user);
  const isAdminRaw = useAuth((s) => s.isAdmin);
  const isAdmin = typeof isAdminRaw === "function" ? !!isAdminRaw() : !!isAdminRaw;

  const authed = !!user;
  const navigate = useNavigate();

  // 로그인 다이얼로그
  const [loginOpen, setLoginOpen] = React.useState(false);
  const pendingAction = React.useRef<null | (() => void)>(null);
  const requireLoginThen = (fn: () => void) => {
    if (authed) fn();
    else { pendingAction.current = fn; setLoginOpen(true); }
  };
  const handleLoginSuccess = () => {
    const next = pendingAction.current;
    pendingAction.current = null;
    setLoginOpen(false);
    if (next) next();
  };
  React.useEffect(() => { if (!authed) setLoginOpen(true); }, [authed]);

  // Snackbar (피드백)
  const [snack, setSnack] = React.useState<string | null>(null);
  const showSnack = (msg: string) => setSnack(msg);

  /* 상태 */
  const { favoriteTeam, setFavoriteTeam } = useSettings();
  const [teamDraft, setTeamDraft] = React.useState(favoriteTeam);
  React.useEffect(() => setTeamDraft(favoriteTeam), [favoriteTeam]);

  const saveTeam = () =>
    requireLoginThen(() => {
      if (teamDraft === favoriteTeam) {
        showSnack("변경된 내용이 없습니다.");
        return;
      }
      setFavoriteTeam(teamDraft);
      const label = TEAMS.find((t) => t.id === teamDraft)?.label || "선택 안 함";
      showSnack(`선호 팀이 "${label}"으로 저장되었습니다.`);
    });

  const resetTeam = () =>
    requireLoginThen(() => {
      setTeamDraft("");
      setFavoriteTeam("");
      showSnack("선호 팀이 초기화되었습니다.");
    });

  // 알림 (로컬 UI 데모 상태)
  const [notifyComment, setNotifyComment] = React.useState(true);
  const [notifyReply, setNotifyReply]     = React.useState(true);
  const [notifyLike, setNotifyLike]       = React.useState(true);
  const [notifySound, setNotifySound]     = React.useState(false);

  // 표시/접근성
  const [themeMode, setThemeMode] = React.useState<"light" | "dark">("light");
  const [fontScale, setFontScale] = React.useState<"normal" | "large">("normal");
  const [, setReduceMotion] = React.useState(false);
  const [, setDensity] = React.useState<"comfortable" | "compact">("comfortable");

  // 통합 초기화
  const reset = () => {
    setFavoriteTeam("");
    setTeamDraft("");
    setNotifyComment(true);
    setNotifyReply(true);
    setNotifyLike(true);
    setNotifySound(false);
    setThemeMode("light");
    setFontScale("normal");
    setReduceMotion(false);
    setDensity("comfortable");
    showSnack("설정이 기본값으로 초기화되었습니다.");
  };

  // 통계/배지
  const myId = (user?.email ?? user?.id ?? "").toLowerCase();
  const stats = React.useMemo(() => getStats(myId), [myId]);
  const badges = React.useMemo(() => buildBadges(stats), [stats]);

  //  선호 팀 오브젝트 + 안전한 접근
  const favTeamObj = React.useMemo(() => {
    const key = favoriteTeam as keyof typeof TEAM_DATA | undefined;
    return key ? TEAM_DATA[key] : undefined;
  }, [favoriteTeam]);

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: { xs: 14, md: 10 } }}>
      {/* 상단 헤더 */}
      <Paper variant="outlined" sx={{ ...CARD, px: 2, py: 1.5, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TuneRounded color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>설정</Typography>
          <Chip size="small" icon={<InfoOutlined />} label="UI 데모" sx={{ ml: 1 }} />
        </Stack>
      </Paper>

      {/* ===== 메인 레이아웃 ===== */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
          gridTemplateRows: { xs: "auto", md: "auto auto auto" },
          alignItems: "stretch",
        }}
      >
        {/* (좌) 프로필: 2행 span */}
        <Paper
          variant="outlined"
          sx={{
            ...CARD,
            p: 2,
            gridColumn: { xs: "1 / -1", md: "1 / 2" },
            gridRow: { xs: "auto", md: "1 / 3" },
            height: "100%",
          }}
        >
          <Stack alignItems="center" spacing={G}>
            {/* ✅ 선호 팀 로고 아바타 (실패 시 이니셜 폴백) */}
            <Avatar
              src={withAsset(favTeamObj?.logo)}
              alt={favTeamObj?.name || (user?.name ?? "Guest")}
              sx={{
                width: 72,
                height: 72,
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(10,15,28,.12)",
                ...(favTeamObj && {
                  bgcolor: `${favTeamObj.color}12`,
                  border: `2px solid ${favTeamObj.color}`,
                }),
              }}
              imgProps={{ referrerPolicy: "no-referrer" }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "G"}
            </Avatar>

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0 }}>
              {user?.name ?? "Guest"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: -0.5 }}>
              {authed ? user?.email : "로그인하면 더 많은 기능을 사용할 수 있어요."}
            </Typography>

            {/* ✅ 선택된 팀 라벨(있을 때만) */}
            {favTeamObj && (
              <Chip
                size="small"
                label={favTeamObj.name}
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  bgcolor: `${favTeamObj.color}14`,
                  color: favTeamObj.color,
                  borderColor: favTeamObj.color,
                  mt: -0.25,
                }}
              />
            )}

            {isAdmin && (
              <Chip
                size="small"
                label="Admin"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  bgcolor: "rgba(0,20,137,0.06)",
                  color: "primary.main",
                  borderColor: "rgba(0,20,137,0.18)",
                  mt: -0.25,
                }}
              />
            )}

            {/* 성취 배지 */}
            <Box sx={{ width: "100%", mt: G - 0.25, mb: G - 0.25 }}>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1.25}
                justifyContent="center"
                alignItems="center"
              >
                {badges.map((b) => (
                  <Tooltip key={b.id} title={b.tip}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: "50%",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        "& svg": { fontSize: 18 },
                        bgcolor: b.achieved ? RB_NAVY : "transparent",
                        color: b.achieved ? "#fff" : RB_NAVY,
                        border: "1px solid",
                        borderColor: b.achieved ? "rgba(0,20,137,0)" : "rgba(0,20,137,.45)",
                        boxShadow: b.achieved ? "0 2px 6px rgba(0,20,137,.28)" : "none",
                        position: "relative",
                        transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
                        ...(b.achieved && {
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            right: -2, bottom: -2,
                            width: 8, height: 8, borderRadius: "50%",
                            background: RB_YELLOW,
                            boxShadow: "0 0 0 1px rgba(0,0,0,.08)",
                          },
                        }),
                        "&:hover, &:focus-visible": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 0 0 2px ${RB_YELLOW} inset, 0 4px 12px rgba(0,20,137,.20)`,
                          borderColor: RB_YELLOW,
                          outline: "none",
                        },
                      }}
                      aria-label={b.label}
                    >
                      {b.icon}
                    </Box>
                  </Tooltip>
                ))}

                {!badges.some((b) => b.achieved) && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", width: "100%" }}
                  >
                    아직 획득한 배지가 없습니다. <br/>첫 글을 작성해볼까요?
                  </Typography>
                )}
              </Stack>
            </Box>

            <Divider flexItem sx={{ my: G, borderColor: "rgba(17,24,39,.08)" }} />

            {/* 프로필 수정 */}
            <Tooltip title="UI만 제공 — 실제 수정 기능은 추후 연결">
              <Button
                color="error"
                size="small"
                variant="text"
                onClick={() =>
                  requireLoginThen(() => alert("프로필 수정은 추후 연결 예정입니다."))
                }
                sx={{ fontWeight: 900, alignSelf: "center", mt: -0.25 }}
              >
                프로필 수정
              </Button>
            </Tooltip>

            {/* 빠른 이동 */}
            <Stack spacing={1} sx={{ width: "100%", mt: G - 0.25 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  height: 40, borderRadius: 999, fontWeight: 800,
                  "&:focus-visible": { outline: `3px solid rgba(0,20,137,.24)`, outlineOffset: 2 },
                }}
                onClick={() => requireLoginThen(() => navigate("/activity/posts"))}
              >
                내 글 보기
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  height: 40, borderRadius: 999, fontWeight: 800,
                  "&:focus-visible": { outline: `3px solid rgba(0,20,137,.24)`, outlineOffset: 2 },
                }}
                onClick={() => requireLoginThen(() => navigate("/activity/comments"))}
              >
                내 댓글 보기
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  height: 40, borderRadius: 999, fontWeight: 800,
                  "&:focus-visible": { outline: `3px solid rgba(0,20,137,.24)`, outlineOffset: 2 },
                }}
                onClick={() => requireLoginThen(() => navigate("/activity/media"))}
              >
                내 미디어 보기
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* (우 상단) 선호 팀 */}
        <Section
          title="선호 팀"
          icon={<FavoriteRounded color="primary" />}
          hint="좋아하는 팀을 선택하세요."
          sx={{
            gridColumn: { xs: "1 / -1", md: "2 / 3" },
            gridRow: { xs: "auto", md: "1 / 2" },
          }}
        >
          <Stack spacing={1.25}>
            <TextField
              select
              label="팀 선택"
              value={teamDraft}
              onChange={(e) => requireLoginThen(() => setTeamDraft(e.target.value))}
              helperText={
                teamDraft
                  ? TEAMS.find((t) => t.id === teamDraft)?.label
                  : "선택 안 함"
              }
              fullWidth
            >
              <MenuItem value="">(선택 안 함)</MenuItem>
              {TEAMS.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Button onClick={resetTeam}>초기화</Button>
              <Button
                variant="contained"
                onClick={saveTeam}
                disabled={teamDraft === favoriteTeam}
              >
                저장
              </Button>
            </Stack>
          </Stack>
        </Section>

        {/* (우 중단) 알림 */}
        <Section
          title="알림"
          icon={<NotificationsActiveRounded color="primary" />}
          sx={{
            gridColumn: { xs: "1 / -1", md: "2 / 3" },
            gridRow: { xs: "auto", md: "2 / 3" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 0.5,
              mb: 0.2,
              px: 5,
            }}
          >
            {[
              { label: "새 댓글", state: notifyComment, setter: setNotifyComment },
              { label: "새 답글", state: notifyReply, setter: setNotifyReply },
              { label: "좋아요", state: notifyLike, setter: setNotifyLike },
              { label: "알림 소리", state: notifySound, setter: setNotifySound },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  flex: { xs: "1 1 100%", sm: "0 0 calc(50% - 12px)" },
                  display: "flex",
                  alignItems: "center",
                  height: 48,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={item.state}
                      onChange={(e) =>
                        requireLoginThen(() => item.setter(e.target.checked))
                      }
                    />
                  }
                  label={item.label}
                  sx={{
                    m: 0,
                    pl: 5,
                    width: "100%",
                    alignItems: "center",
                    "& .MuiFormControlLabel-label": { fontWeight: 500 },
                  }}
                />
              </Box>
            ))}
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
            <Button onClick={() => requireLoginThen(reset)} sx={{ fontWeight: 700 }}>
              초기화
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                requireLoginThen(() => {
                  alert("알림 설정이 저장되었습니다.");
                })
              }
              sx={{ fontWeight: 800, px: 3, borderRadius: "12px" }}
            >
              저장
            </Button>
          </Stack>
        </Section>

        {/* (하단) 표시/접근성 · 고객지원/법적 고지 */}
        <Box
          sx={{
            gridColumn: "1 / -1",
            gridRow: { xs: "auto", md: "3 / 4" },
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Section title="표시 / 접근성" icon={<InfoOutlined color="primary" />}>
            <Stack spacing={1.25}>
              <TextField
                select
                label="테마"
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as "light" | "dark")}
                fullWidth
              >
                <MenuItem value="light">라이트</MenuItem>
                <MenuItem value="dark">다크</MenuItem>
              </TextField>

              <TextField
                select
                label="글자 크기"
                value={fontScale}
                onChange={(e) => setFontScale(e.target.value as "normal" | "large")}
                fullWidth
              >
                <MenuItem value="normal">보통</MenuItem>
                <MenuItem value="large">크게</MenuItem>
              </TextField>
            </Stack>
          </Section>

          <Section title="고객지원 / 법적 고지" icon={<InfoOutlined color="primary" />}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} sx={{ pt: 1.3, width: "100%", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ height: 48, borderRadius: 2, fontWeight: 800, px: 2 }}
                  onClick={() =>
                    requireLoginThen(() => alert("버그 신고 폼은 추후 연결될 예정입니다."))
                  }
                >
                  버그 신고
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ height: 48, borderRadius: 2, fontWeight: 800, px: 2 }}
                  onClick={() =>
                    requireLoginThen(() => alert("의견 보내기 폼은 추후 연결될 예정입니다."))
                  }
                >
                  의견 보내기
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "center" }}>
                <Button fullWidth sx={{ height: 48, borderRadius: 2, fontWeight: 800, px: 2 }} onClick={() => navigate("/terms")}>
                  이용약관
                </Button>
                <Button fullWidth sx={{ height: 48, borderRadius: 2, fontWeight: 800, px: 2 }} onClick={() => navigate("/privacy")}>
                  개인정보처리방침
                </Button>
              </Stack>
            </Stack>
          </Section>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={!!snack}
        autoHideDuration={2200}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 700 }}>
          {snack}
        </Alert>
      </Snackbar>

      {/* 로그인 다이얼로그 */}
      <LoginDialog
        open={loginOpen}
        onClose={() => { setLoginOpen(false); pendingAction.current = null; }}
        onSuccess={handleLoginSuccess}
      />
    </Container>
  );
}

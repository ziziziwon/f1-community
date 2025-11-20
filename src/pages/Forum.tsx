// src/pages/Forum.tsx
import * as React from "react";
import {
  Container, Typography, Stack, Card, CardContent, Button,
  TextField, MenuItem, Box, Chip, InputAdornment, IconButton, Paper
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ClearRounded from "@mui/icons-material/ClearRounded";
import FlagRounded from "@mui/icons-material/FlagRounded";
import { useAuth } from "../stores/auth";
import { useNavigate } from "react-router-dom";
import LoginDialog from "../components/LoginDialog";
import { useCommunityStore } from "../stores/community";

/* ================= Types ================= */
type Cat = "strategy" | "driver" | "free";
type Comment = { id: string; author: string; authorId: string; body: string; createdAt: string };
type ThreadEx = {
  id: string; title: string; content: string;
  author: string; authorId: string; createdAt: string;
  category: Cat; comments: Comment[]; views: number;
  likes: number; dislikes: number;
};

/* ================= Consts ================= */
const STORE_KEY = "apex-forum-threads";
const CAT_LABEL: Record<Cat, string> = { strategy: "Strategy", driver: "Driver", free: "Free" };
const NAVY = "#001489", RED = "#DA291C", YELL = "#FFD100";
const CHIP_BG: Record<Cat, string> = { free: NAVY, strategy: YELL, driver: RED };

const chipSx = (cat: Cat) => ({
  height: 22,
  borderRadius: 6,
  fontWeight: 800,
  letterSpacing: 0.2,
  color: "#fff",
  backgroundColor: `${CHIP_BG[cat]} !important`,
  border: "none !important",
  "& .MuiChip-label": { px: 1, pt: "1px", pb: 0, color: "#fff !important" },
});

const rid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const asStr = (v: any, fb = ""): string => (typeof v === "string" && v.length > 0 ? v : fb);
const asNum = (v: any, fb = 0): number => (Number.isFinite(Number(v)) ? Number(v) : fb);
const normCat = (v: any): Cat => (v === "strategy" || v === "driver" || v === "free" ? v : "free");
const normComment = (c: any): Comment => ({
  id: asStr(c?.id, rid()),
  author: asStr(c?.author, "anon"),
  authorId: asStr(c?.authorId, "seed@local"),
  body: asStr(c?.body, ""),
  createdAt: asStr(c?.createdAt, new Date().toISOString()),
});
const normalizeThread = (t: any): ThreadEx => ({
  id: asStr(t?.id, rid()),
  title: asStr(t?.title, ""),
  content: asStr(t?.content, ""),
  author: asStr(t?.author, "anon"),
  authorId: asStr(t?.authorId, "seed@local"),
  createdAt: asStr(t?.createdAt, new Date().toISOString()),
  category: normCat(t?.category),
  comments: Array.isArray(t?.comments) ? t.comments.map(normComment) : [],
  views: asNum(t?.views, 0),
  likes: asNum(t?.likes, 0),
  dislikes: asNum(t?.dislikes, 0),
});

const loadThreads = (): ThreadEx[] => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data.map(normalizeThread);
    }
  } catch {}
  return [];
};
const saveThreads = (rows: ThreadEx[]) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(rows)); } catch {}
};

/* ================= Component ================= */
export default function Forum() {
  const [rows, setRows] = React.useState<ThreadEx[]>(() => loadThreads());
  const setPosts = useCommunityStore((s) => s.setPosts);

  React.useEffect(() => {
    saveThreads(rows);
    setPosts(
    rows.map((t): any => ({
    id: t.id,
    title: t.title,
    author: t.author,
    views: t.views ?? 0,
    comments: Array.isArray(t.comments) ? t.comments.length : 0,
    likes: t.likes ?? 0,
    category: t.category ?? "free",
    createdAt: t.createdAt ?? new Date().toISOString(),
   }))
  );
  }, [rows, setPosts]);

  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const isAdmin = useAuth((s) => s.isAdmin);
  const navigate = useNavigate();

  const PAGE_SIZE = 10;
  const perPage = PAGE_SIZE; // ✅ 추가됨
  const [page, setPage] = React.useState(1);

  // ✅ Pagination 핸들러 추가
  const handleChangePage = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const [q, setQ] = React.useState("");
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [cat, setCat] = React.useState<Cat>("free");
  const canPost = title.trim() && content.trim();
  const [loginOpen, setLoginOpen] = React.useState(false);

  const openComposer = () => {
    if (!isAuthenticated()) { setLoginOpen(true); return; }
    setComposeOpen((v) => !v);
  };
  const resetCompose = () => { setTitle(""); setContent(""); setCat("free"); };

  const submitThread = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canPost || !user) return;
    const authorId = user.email ?? user.id;
    const next: ThreadEx = {
      id: rid(),
      title: title.trim(),
      content: content.trim(),
      author: user.name,
      authorId,
      createdAt: new Date().toISOString(),
      category: cat,
      comments: [],
      views: 0,
      likes: 0,
      dislikes: 0,
    };
    setRows((prev) => [next, ...prev]);
    resetCompose();
    setComposeOpen(false);
    navigate(`/forum/${next.id}`);
  };

  const canDelete = (t: ThreadEx): boolean => {
    if (isAdmin()) return true;
    if (!user) return false;
    const me = user.email ?? user.id;
    return t.authorId === me;
  };
  const handleDelete = (id: string) => {
    const t = rows.find((r) => r.id === id);
    if (!t) return;
    if (!canDelete(t)) { alert("삭제 권한이 없습니다."); return; }
    if (!confirm("정말 이 글을 삭제할까요?")) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  // ===== 리스트 정렬 =====
  const list = React.useMemo(
    () => [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [rows]
  );

  // ===== 검색 필터 =====
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((t) => {
      const hay = [
        t.title ?? "",
        t.content ?? "",
        t.author ?? "",
        CAT_LABEL[t.category] ?? "",
        t.category === "strategy" ? "전략" :
        t.category === "driver" ? "드라이버" :
        t.category === "free" ? "자유" : ""
      ].join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [q, list]);

  React.useEffect(() => { setPage(1); }, [q]);
  // totalPages는 Pagination에서 계산되므로 별도 변수는 사용하지 않습니다
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  return (
    <Container sx={{ py: 4, pb: { xs: 14, md: 10 } }}>
      {/* ===== 상단 바 ===== */}
      <Box
        sx={{
          mb: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "auto 1fr auto" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <FlagRounded sx={{ color: "#001489", fontSize: 40 }} />
        <TextField
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search threads by title, content, author, category"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: q && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQ("")}>
                  <ClearRounded />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 880,
            "& .MuiOutlinedInput-root": {
              height: 52,
              borderRadius: 9999,
              bgcolor: "background.paper",
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<EditRounded />}
          onClick={openComposer}
          disableElevation
          sx={{
            height: 52,
            px: 3,
            borderRadius: 9999,
            fontWeight: 900,
            bgcolor: "#DC1F26",
            "&:hover": { bgcolor: "#c21b21" },
          }}
        >
          {composeOpen ? "Close" : "Post"}
        </Button>
      </Box>

      {/* ===== 작성 폼 ===== */}
      {composeOpen && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Box component="form" onSubmit={submitThread}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
              <TextField select label="Category" value={cat} onChange={(e) => setCat(e.target.value as Cat)} sx={{ minWidth: 180 }}>
                <MenuItem value="strategy">Strategy</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
                <MenuItem value="free">Free</MenuItem>
              </TextField>
              <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} inputProps={{ maxLength: 120 }} helperText={`${title.length}/120`} />
            </Stack>
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              multiline
              minRows={8}
              placeholder="Share your race analysis, pit strategy, radio moments"
              sx={{ mb: 1.5 }}
            />
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" startIcon={<EditRounded />} disabled={!canPost}>Post</Button>
              <Button onClick={() => { resetCompose(); setComposeOpen(false); }}>Cancel</Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* ===== 카운트 ===== */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {q ? `Results: ${filtered.length}` : `Threads: ${list.length}`}
      </Typography>

      {/* ===== 목록 ===== */}
      <Stack spacing={1.8}>
        {pageItems.map((t) => {
          const deletable = canDelete(t);
          return (
            <Card
              key={t.id}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                transition: "transform .2s ease, box-shadow .2s ease",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" },
              }}
            >
              <CardContent
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 68,
                }}
              >
                <Box
                  onClick={() => navigate(`/forum/${t.id}`)}
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    cursor: "pointer",
                    position: "relative",
                    top: "2px",
                  }}
                >
                  <Chip
                    label={CAT_LABEL[t.category]}
                    size="small"
                    sx={{
                      ...chipSx(t.category),
                      position: "relative",
                      top: "3px",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                      position: "relative",
                      top: "2.5px",
                    }}
                  >
                    {t.title}
                  </Typography>
                </Box>

                {/* 우측 메타 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    position: "relative",
                    top: "3px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      height: 28,
                      px: 1.25,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 9999,
                      bgcolor: "background.paper",
                      position: "relative",
                      top: "1px",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      by&nbsp;{t.author}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <VisibilityRounded sx={{ fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.views ?? 0}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.comments.length}</Typography>
                    </Stack>
                  </Box>

                  {deletable && (
                    <IconButton onClick={() => handleDelete(t.id)} size="small" color="error">
                      <DeleteOutlineRounded />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* ===== 페이지네이션 ===== */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={Math.ceil(filtered.length / perPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
          shape="rounded"
        />
      </Box>

      {/* ===== 로그인 다이얼로그 ===== */}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
          setComposeOpen(true);
        }}
      />
    </Container>
  );
}

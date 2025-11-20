import * as React from "react";
import {
  Container, Stack, Typography, Paper, Box, Checkbox, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Toolbar, Button, Chip,
  IconButton, useMediaQuery
} from "@mui/material";
import { GlobalStyles } from "@mui/system";
import ArticleRounded from "@mui/icons-material/ArticleRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";

import LoginDialog from "../components/LoginDialog";
import { useAuth } from "../stores/auth";
import { useNavigate } from "react-router-dom";

/* ===== 색/칩 ===== */
const NAVY = "#001489";
const RED  = "#DA291C";
const YELL = "#FFD100";

type Cat = "strategy" | "driver" | "free";
const CAT_LABEL: Record<Cat, string> = { strategy: "Strategy", driver: "Driver", free: "Free" };
const CAT_CHIP_SX: Record<Cat, any> = {
  free:     { bgcolor: NAVY, color: "#fff" },
  strategy: { bgcolor: YELL, color: "#111827" },
  driver:   { bgcolor: RED,  color: "#fff" },
};

/* ===== 데이터 스키마 & 스토리지 키 ===== */
type ThreadEx = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  category: Cat;
  comments: { id: string }[];
  views: number;
  likes?: number;
  dislikes?: number;
};
const STORE_KEY = "apex-forum-threads";

/* ===== 유틸 ===== */
const asStr = (v: any, fb = ""): string => (typeof v === "string" && v.length > 0 ? v : fb);
const asNum = (v: any, fb = 0): number => (Number.isFinite(Number(v)) ? Number(v) : fb);
const normCat = (v: any): Cat => (v === "strategy" || v === "driver" || v === "free" ? v : "free");

function normalizeThread(t: any): ThreadEx {
  return {
    id: asStr(t?.id),
    title: asStr(t?.title),
    content: asStr(t?.content),
    author: asStr(t?.author, "anon"),
    authorId: asStr(t?.authorId, "seed@local"),
    createdAt: asStr(t?.createdAt, new Date().toISOString()),
    category: normCat(t?.category),
    comments: Array.isArray(t?.comments) ? t.comments : [],
    views: asNum(t?.views, 0),
    likes: asNum(t?.likes, 0),
    dislikes: asNum(t?.dislikes, 0),
  };
}

function loadThreadsMine(myId: string): ThreadEx[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeThread)
      .filter((t) => (t.authorId ?? "").toLowerCase() === myId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

/* ===== 레이아웃 토큰 ===== */
const ROW_H = 56;
const COLS = { checkbox: 72, title: 420, category: 124, date: 152, comments: 96, likes: 96 };
const ellipsis1 = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as const;

/* ===== 중앙 숫자 페이저 ===== */
function CenterPager({
  count, page, rpp, onChangePage, navy = NAVY,
}: {
  count: number; page: number; rpp: number; onChangePage: (p: number) => void; navy?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(count / rpp));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;
  const isSmall = useMediaQuery("(max-width:600px)");

  const windowSize = isSmall ? 3 : 5;
  const items: (number | "…")[] = [];
  const push = (v: number | "…") => (items[items.length - 1] !== v ? items.push(v) : undefined);

  for (let p = 0; p < totalPages; p++) {
    const edge = p === 0 || p === totalPages - 1;
    const inWindow = Math.abs(p - page) <= Math.floor(windowSize / 2);
    if (edge || inWindow) push(p);
    else if (items[items.length - 1] !== "…") push("…");
  }

  return (
    <Box
      sx={{
        borderTop: "1px solid rgba(17,24,39,.08)",
        px: { xs: 1.5, sm: 2 },
        py: { xs: 3.5, sm: 2.75 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fff",
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small" disabled={!canPrev}
          onClick={() => onChangePage(Math.max(0, page - 1))}
          sx={{
            width: 28, height: 28, borderRadius: 999,
            color: canPrev ? navy : "text.disabled",
            bgcolor: canPrev ? "rgba(0,20,137,.06)" : "transparent",
            "&:hover": { bgcolor: "rgba(0,20,137,.12)" },
          }}
        >
          <ChevronLeftRounded fontSize="small" />
        </IconButton>

        {items.map((it, i) =>
          it === "…" ? (
            <Box key={`d-${i}`} sx={{ px: 0.5, color: "#9CA3AF", fontWeight: 800, fontSize: 14 }}>…</Box>
          ) : (
            <Button
              key={it}
              onClick={() => onChangePage(it)}
              size="small"
              variant={page === it ? "contained" : "text"}
              disableElevation
              sx={{
                minWidth: 28, height: 28, px: 0.75, borderRadius: 999,
                fontWeight: 900, fontSize: 13,
                ...(page === it
                  ? { bgcolor: navy, color: "#fff", "&:hover": { bgcolor: "#0a1b7a" } }
                  : { color: navy }),
              }}
            >
              {it + 1}
            </Button>
          )
        )}

        <IconButton
          size="small" disabled={!canNext}
          onClick={() => onChangePage(Math.min(totalPages - 1, page + 1))}
          sx={{
            width: 28, height: 28, borderRadius: 999,
            color: canNext ? navy : "text.disabled",
            bgcolor: canNext ? "rgba(0,20,137,.06)" : "transparent",
            "&:hover": { bgcolor: "rgba(0,20,137,.12)" },
          }}
        >
          <ChevronRightRounded fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

/* ===== 컴포넌트 ===== */
export default function MyPosts() {
  const user = useAuth((s) => s.user);
  const authed = !!user;
  const navigate = useNavigate();

  // 로그인 유도
  const [loginOpen, setLoginOpen] = React.useState(false);
  React.useEffect(() => { if (!authed) setLoginOpen(true); }, [authed]);

  const myId = (user?.email ?? user?.id ?? "").toLowerCase();

  // 데이터
  const [rows, setRows] = React.useState<ThreadEx[]>(() => (myId ? loadThreadsMine(myId) : []));
  React.useEffect(() => { if (myId) setRows(loadThreadsMine(myId)); }, [myId]);

  // 선택/페이지네이션
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);
  const [rpp]  = React.useState(10);

  const pageRows = rows.slice(page * rpp, page * rpp + rpp);
  const isSelected = (id: string) => selected.has(id);
  const allInPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const toggleAllPage = (checked: boolean) => {
    const next = new Set(selected);
    pageRows.forEach((r) => { checked ? next.add(r.id) : next.delete(r.id); });
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const koDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });

  return (
    <Container sx={{ py: 4, pb: { xs: 14, md: 10 } }}>
      {/* 이 컴포넌트 전용 글로벌 규칙 */}
      <GlobalStyles styles={{
        ".mc-cell": { height: ROW_H, verticalAlign: "middle", paddingTop: 0, paddingBottom: 0 },
        ".mc-check": {
          width: `${COLS.checkbox}px`, minWidth: `${COLS.checkbox}px`, maxWidth: `${COLS.checkbox}px`,
          boxSizing: "border-box", paddingLeft: "20px", paddingRight: "8px", overflow: "visible",
        },
        ".mc-check .MuiCheckbox-root": { margin: 0, padding: 4 },
        ".mc-center": { textAlign: "center" },
        ".mc-right":  { textAlign: "right"  },
        "thead .MuiTableCell-head": {
          backgroundColor: "#F7F9FC", fontWeight: 900, color: "#111827",
          borderBottom: "1px solid rgba(17,24,39,.08)", height: ROW_H, verticalAlign: "middle"
        },
        /* ▼ MyPosts 전용: 중앙정렬용 패딩 제거 */
        ".mp-cat":  { paddingLeft: 0, paddingRight: 0 },
        ".mp-date": { paddingLeft: 0, paddingRight: 0 },
        ".mp-cmt":  { paddingLeft: 0, paddingRight: 0 },
        ".mp-like": { paddingLeft: 0, paddingRight: 0 },
      }} />

      {/* 헤더 + 뒤로가기(설정으로) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ArticleRounded sx={{ color: NAVY }} />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>내 글</Typography>
          <Chip size="small" label="내가 작성한 게시글" sx={{ ml: 1, fontWeight: 800, bgcolor: "#EEF2FF", color: NAVY }} />
        </Stack>

        <Button
          startIcon={<ArrowBackRounded sx={{ fontSize: 20 }} />}
          onClick={() => navigate("/settings")}
          variant="text"
          disableElevation
          sx={{
            color: NAVY,
            fontWeight: 900,
            textTransform: "none",
            fontSize: 14,
            letterSpacing: 0.1,
            borderRadius: 999,
            px: 1.75,
            height: 38,
            bgcolor: "transparent",
            boxShadow: "none",
            transition: "background-color .18s ease, box-shadow .18s ease, transform .05s ease",
            "&:hover": {
              bgcolor: "rgba(0,20,137,.10)",
              boxShadow: "0 8px 24px rgba(10,15,28,.10), 0 1px 0 rgba(0,0,0,.04) inset",
            },
            "&:active": { bgcolor: "rgba(0,20,137,.16)" },
            "&:focus-visible": { outline: "none", boxShadow: "0 0 0 3px rgba(0,20,137,.22)" },
            "& .MuiButton-startIcon": { mr: 0.75 },
          }}
          aria-label="설정으로"
        >
          Settings
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          borderColor: "rgba(17,24,39,.08)",
          boxShadow: "0 6px 24px rgba(10,15,28,.06)"
        }}
      >
        {/* 툴바 */}
        <Toolbar
          sx={{
            px: 2, py: 1, minHeight: ROW_H,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid", borderColor: "divider", bgcolor: "#F7F9FC",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            {selected.size ? `${selected.size}개 선택됨` : `총 ${rows.length}개`}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<DeleteOutlineRounded />}
              disabled={selected.size === 0}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              onClick={() => alert("데모 UI입니다. 실제 삭제는 백엔드 연결 후 구현됩니다.")}
            >
              삭제
            </Button>
            <Button
              size="small"
              startIcon={<OpenInNewRounded />}
              disabled={selected.size !== 1}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, color: NAVY }}
              onClick={() => {
                const id = Array.from(selected)[0];
                if (id) navigate(`/forum/${encodeURIComponent(id)}`);
              }}
            >
              열기
            </Button>
          </Stack>
        </Toolbar>

        {/* 표 */}
        <TableContainer sx={{ maxHeight: 560, px: 2, overflowX: "visible" }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              tableLayout: "fixed",
              "& tbody tr:nth-of-type(even)": { bgcolor: "rgba(0,0,0,.015)" },
              "& tbody tr:hover": { bgcolor: "rgba(0,20,137,0.03)" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell className="mc-cell mc-check">
                  <Checkbox
                    indeterminate={
                      pageRows.length > 0 &&
                      !allInPageSelected &&
                      Array.from(selected).some((id) => pageRows.find((r) => r.id === id))
                    }
                    checked={allInPageSelected}
                    onChange={(e) => toggleAllPage(e.target.checked)}
                    sx={{ "&.Mui-checked": { color: NAVY } }}
                  />
                </TableCell>

                <TableCell className="mc-cell" sx={{ width: COLS.title, minWidth: COLS.title }}>
                  제목
                </TableCell>

                {/* ▼ 카테고리 헤더 중앙 */}
                <TableCell className="mc-cell mp-cat" sx={{ width: COLS.category, minWidth: COLS.category }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      카테고리
                    </Typography>
                  </Box>
                </TableCell>

                {/* ▼ 작성일 헤더 중앙 */}
                <TableCell className="mc-cell mp-date" sx={{ width: COLS.date, minWidth: COLS.date }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      작성일
                    </Typography>
                  </Box>
                </TableCell>

                {/* ▼ 댓글 헤더 중앙 */}
                <TableCell className="mc-cell mp-cmt" sx={{ width: COLS.comments, minWidth: COLS.comments }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      댓글
                    </Typography>
                  </Box>
                </TableCell>

                {/* ▼ 좋아요 헤더 중앙 */}
                <TableCell className="mc-cell mp-like" sx={{ width: COLS.likes, minWidth: COLS.likes }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      좋아요
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="mc-cell">
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                        아직 불러올 데이터가 없어요
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        서버 연결 전까지는 데모 형태로만 보여집니다.
                      </Typography>
                      <Button sx={{ mt: 2, borderRadius: 2 }} variant="contained" onClick={() => navigate("/forum")}>
                        Paddock으로 가기
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((r) => {
                  const sel = isSelected(r.id);
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      selected={sel}
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/forum/${encodeURIComponent(r.id)}`)}
                    >
                      <TableCell
                        className="mc-cell mc-check"
                        onClick={(e) => { e.stopPropagation(); toggleOne(r.id); }}
                      >
                        <Checkbox checked={sel} sx={{ "&.Mui-checked": { color: NAVY } }} />
                      </TableCell>

                      <TableCell
                        className="mc-cell"
                        title={r.title}
                        sx={{ ...ellipsis1, color: NAVY, fontWeight: 800, "&:hover": { textDecoration: "underline" } }}
                      >
                        {r.title || <span style={{ color: "#9ca3af" }}>(제목 없음)</span>}
                      </TableCell>

                      {/* ▼ 카테고리 중앙 */}
                      <TableCell className="mc-cell mp-cat" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Chip size="small" label={CAT_LABEL[r.category]} sx={{ fontWeight: 900, borderRadius: 999, ...CAT_CHIP_SX[r.category] }} />
                        </Box>
                      </TableCell>

                      {/* ▼ 작성일 중앙 */}
                      <TableCell className="mc-cell mp-date" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Typography
                            sx={{
                              color: "#6B7280",
                              fontWeight: 700,
                              fontVariantNumeric: "tabular-nums",
                              fontFeatureSettings: '"tnum"',
                              fontSize: 13.5,
                              lineHeight: "18px",
                            }}
                          >
                            {koDate(r.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* ▼ 댓글 중앙 */}
                      <TableCell className="mc-cell mp-cmt" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {r.comments?.length ?? 0}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* ▼ 좋아요 중앙 */}
                      <TableCell className="mc-cell mp-like" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>
                            {r.likes ?? 0}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 숫자 네비 */}
        <CenterPager count={rows.length} page={page} rpp={rpp} onChangePage={(p) => setPage(p)} />
      </Paper>

      {/* 로그인 다이얼로그 */}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => setLoginOpen(false)} />
    </Container>
  );
}

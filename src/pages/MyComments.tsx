import * as React from "react";
import {
  Container, Stack, Typography, Paper, Box, Checkbox, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Toolbar, Button, Chip,
  IconButton, useMediaQuery
} from "@mui/material";
import { GlobalStyles } from "@mui/system";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import SubdirectoryArrowRightRounded from "@mui/icons-material/SubdirectoryArrowRightRounded";
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

/* ===== 데이터 스키마 ===== */
type Comment = { id: string; author: string; authorId: string; body: string; createdAt: string };
type ThreadEx = {
  id: string; title: string; content: string; author: string; authorId: string;
  createdAt: string; category: Cat; comments: Comment[]; views: number; likes?: number; dislikes?: number;
};
type Reply = { id: string; author: string; authorId: string; body: string; createdAt: string };

const STORE_KEY = "apex-forum-threads";
const REPLIES_KEY = "apex-forum-replies";

/* ===== 유틸 ===== */
const asStr  = (v: any, fb = "") => (typeof v === "string" && v.length ? v : fb);
const asNum  = (v: any, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const normCat = (v: any): Cat => (v === "strategy" || v === "driver" || v === "free" ? v : "free");

function normalizeThread(t: any): ThreadEx {
  return {
    id: asStr(t?.id), title: asStr(t?.title), content: asStr(t?.content),
    author: asStr(t?.author, "anon"), authorId: asStr(t?.authorId, "seed@local"),
    createdAt: asStr(t?.createdAt, new Date().toISOString()),
    category: normCat(t?.category),
    comments: Array.isArray(t?.comments)
      ? t.comments.map((c: any) => ({
          id: asStr(c?.id),
          author: asStr(c?.author, "anon"),
          authorId: asStr(c?.authorId, "seed@local"),
          body: asStr(c?.body, ""),
          createdAt: asStr(c?.createdAt, new Date().toISOString()),
        }))
      : [],
    views: asNum(t?.views, 0), likes: asNum(t?.likes, 0), dislikes: asNum(t?.dislikes, 0),
  };
}
function readReplies(): Record<string, Record<string, Reply[]>> {
  try { return JSON.parse(localStorage.getItem(REPLIES_KEY) || "{}") ?? {}; } catch { return {}; }
}

/* ===== 뷰 모델 ===== */
type RowType = "comment" | "reply";
type Row = {
  kind: RowType; id: string; parentCommentId?: string;
  threadId: string; threadTitle: string; category: Cat; body: string; createdAt: string;
};

function loadMyCommentsAndReplies(myId: string): Row[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const threads: ThreadEx[] = (JSON.parse(raw) as any[]).map(normalizeThread);
    const repliesMap = readReplies();

    const rows: Row[] = [];
    for (const t of threads) {
      for (const c of t.comments) {
        if ((c.authorId ?? "").toLowerCase() === myId)
          rows.push({
            kind: "comment", id: c.id, threadId: t.id,
            threadTitle: t.title || "(제목 없음)", category: t.category,
            body: c.body || "", createdAt: c.createdAt
          });
      }
      const byComment = repliesMap[t.id] || {};
      for (const [commentId, arr] of Object.entries(byComment)) {
        for (const r of (arr as Reply[]) || []) {
          if ((r.authorId ?? "").toLowerCase() === myId)
            rows.push({
              kind: "reply", id: r.id, parentCommentId: commentId, threadId: t.id,
              threadTitle: t.title || "(제목 없음)", category: t.category,
              body: r.body || "", createdAt: r.createdAt
            });
        }
      }
    }
    return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch { return []; }
}

/* ===== 레이아웃 토큰 ===== */
const ROW_H = 56;
const COLS  = { checkbox: 72, kind: 132, title: 420, category: 124, date: 152 };
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
export default function MyComments() {
  const user = useAuth((s) => s.user);
  const authed = !!user;
  const nav = useNavigate();

  // 로그인 유도
  const [loginOpen, setLoginOpen] = React.useState(false);
  React.useEffect(() => { if (!authed) setLoginOpen(true); }, [authed]);

  const myId = (user?.email ?? user?.id ?? "").toLowerCase();

  const [rows, setRows] = React.useState<Row[]>(() => (myId ? loadMyCommentsAndReplies(myId) : []));
  React.useEffect(() => { if (myId) setRows(loadMyCommentsAndReplies(myId)); }, [myId]);

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);
  const [rpp]  = React.useState(10);

  const pageRows = rows.slice(page * rpp, page * rpp + rpp);
  const isSelected = (k: string) => selected.has(k);
  const allInPage = pageRows.length > 0 && pageRows.every(r => selected.has(r.kind + ":" + r.id));

  const toggleAllPage = (checked: boolean) => {
    const next = new Set(selected);
    pageRows.forEach(r => { const k = r.kind + ":" + r.id; checked ? next.add(k) : next.delete(k); });
    setSelected(next);
  };
  const toggleOne = (r: Row) => {
    const k = r.kind + ":" + r.id;
    const next = new Set(selected);
    next.has(k) ? next.delete(k) : next.add(k);
    setSelected(next);
  };

  const koDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  const hash = (r: Row) => (r.kind === "comment" ? `#c-${r.id}` : `#r-${r.id}`);

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
        /* ▼ 유형/카테고리/작성일: 좌우 패딩 제거로 정중앙 느낌 보장 */
        ".mc-kind": { paddingLeft: 0, paddingRight: 0 },
        ".mc-cat":  { paddingLeft: 0, paddingRight: 0 },
        ".mc-date": { paddingLeft: 0, paddingRight: 0 },
      }} />

      {/* 헤더 + 뒤로가기(설정으로) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ChatBubbleOutlineRounded sx={{ color: NAVY }} />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>내 댓글</Typography>
          <Chip size="small" label="내가 작성한 댓글 · 대댓글 " sx={{ ml: 1, fontWeight: 800, bgcolor: "#EEF2FF", color: NAVY }} />
        </Stack>

        <Button
          startIcon={<ArrowBackRounded sx={{ fontSize: 20 }} />}
          onClick={() => nav("/settings")} 
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

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", borderColor: "rgba(17,24,39,.08)", boxShadow: "0 6px 24px rgba(10,15,28,.06)" }}>
        {/* 툴바 */}
        <Toolbar sx={{ px: 2, py: 1, minHeight: ROW_H, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", bgcolor: "#F7F9FC" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            {selected.size ? `${selected.size}개 선택됨` : `총 ${rows.length}개`}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<DeleteOutlineRounded />} disabled={selected.size === 0}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
              onClick={() => alert("데모 UI입니다. 실제 삭제는 서버 연결 후 동작합니다.")}>
              삭제
            </Button>
            <Button size="small" startIcon={<OpenInNewRounded />} disabled={selected.size !== 1}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, color: NAVY }}
              onClick={() => {
                const k = Array.from(selected)[0];
                const [kind, id] = k.split(":");
                const t = rows.find(r => r.kind === (kind as RowType) && r.id === id);
                if (t) nav(`/forum/${encodeURIComponent(t.threadId)}${hash(t)}`);
              }}>
              열기
            </Button>
          </Stack>
        </Toolbar>

        {/* 표 */}
        <TableContainer sx={{ maxHeight: 560, px: 2, overflowX: "visible" }}>
          <Table stickyHeader size="small"
            sx={{
              tableLayout: "fixed",
              "& tbody tr:nth-of-type(even)": { bgcolor: "rgba(0,0,0,.015)" },
              "& tbody tr:hover": { bgcolor: "rgba(0,20,137,0.03)" },
            }}>
            <TableHead>
              <TableRow>
                <TableCell className="mc-cell mc-check">
                  <Checkbox
                    indeterminate={
                      pageRows.length > 0 &&
                      !allInPage &&
                      Array.from(selected).some(k => pageRows.find(r => (r.kind + ":" + r.id) === k))
                    }
                    checked={allInPage}
                    onChange={(e) => toggleAllPage(e.target.checked)}
                    sx={{ "&.Mui-checked": { color: NAVY } }}
                  />
                </TableCell>

                {/* ▼ 유형 헤더: 중앙 박스 + 동일 폰트 */}
                <TableCell className="mc-cell mc-kind" sx={{ width: COLS.kind, minWidth: COLS.kind }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      유형
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell className="mc-cell">내용</TableCell>

                <TableCell className="mc-cell" sx={{ width: COLS.title, minWidth: COLS.title }}>
                  글 제목
                </TableCell>

                {/* ▼ 카테고리 헤더 */}
                <TableCell className="mc-cell mc-cat" sx={{ width: COLS.category, minWidth: COLS.category }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      카테고리
                    </Typography>
                  </Box>
                </TableCell>

                {/* ▼ 작성일 헤더 */}
                <TableCell className="mc-cell mc-date" sx={{ width: COLS.date, minWidth: COLS.date }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      작성일
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
                      <Button sx={{ mt: 2, borderRadius: 2 }} variant="contained" onClick={() => nav("/forum")}>
                        Paddock으로 가기
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((r) => {
                  const key = r.kind + ":" + r.id;
                  const sel = isSelected(key);
                  return (
                    <TableRow
                      key={key}
                      hover
                      selected={sel}
                      sx={{ cursor: "pointer" }}
                      onClick={() => nav(`/forum/${encodeURIComponent(r.threadId)}${hash(r)}`)}
                    >
                      {/* 체크박스 */}
                      <TableCell
                        className="mc-cell mc-check"
                        onClick={(e) => { e.stopPropagation(); toggleOne(r); }}
                      >
                        <Checkbox checked={sel} sx={{ "&.Mui-checked": { color: NAVY } }} />
                      </TableCell>

                      {/* ▼ 유형: 중앙 박스 */}
                      <TableCell className="mc-cell mc-kind" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Chip
                            size="small"
                            icon={r.kind === "comment"
                              ? <ChatBubbleOutlineRounded sx={{ fontSize: 16 }} />
                              : <SubdirectoryArrowRightRounded sx={{ fontSize: 16 }} />}
                            label={r.kind === "comment" ? "댓글" : "대댓글"}
                            sx={{
                              fontWeight: 900,
                              borderRadius: 999,
                              "& .MuiChip-label": { px: 0.5, fontSize: 13.5, lineHeight: "18px" },
                              ...(r.kind === "comment"
                                ? { bgcolor: "#EEF2FF", color: NAVY }
                                : { bgcolor: "rgba(218,41,28,.12)", color: RED }),
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* 내용 */}
                      <TableCell className="mc-cell" sx={{ ...ellipsis1, fontWeight: 700 }} title={r.body}>
                        {r.body || <span style={{ color: "#9ca3af" }}>(빈 내용)</span>}
                      </TableCell>

                      {/* 글 제목 */}
                      <TableCell
                        className="mc-cell"
                        title={r.threadTitle}
                        sx={{ ...ellipsis1, color: NAVY, fontWeight: 800, "&:hover": { textDecoration: "underline" } }}
                      >
                        {r.threadTitle}
                      </TableCell>

                      {/* ▼ 카테고리: 중앙 박스 */}
                      <TableCell className="mc-cell mc-cat" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Chip
                            size="small"
                            label={CAT_LABEL[r.category]}
                            sx={{
                              fontWeight: 900,
                              borderRadius: 999,
                              "& .MuiChip-label": { fontSize: 13.5, lineHeight: "18px" },
                              ...CAT_CHIP_SX[r.category]
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* ▼ 작성일: 중앙 박스 */}
                      <TableCell className="mc-cell mc-date" onClick={(e) => e.stopPropagation()}>
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ★ 숫자 네비만, 중앙 배치 */}
        <CenterPager count={rows.length} page={page} rpp={rpp} onChangePage={(p) => setPage(p)} />
      </Paper>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={() => setLoginOpen(false)} />
    </Container>
  );
}

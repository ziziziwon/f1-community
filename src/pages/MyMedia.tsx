// src/pages/MyMedia.tsx
import * as React from "react";
import {
  Container, Stack, Typography, Paper, Box, Checkbox, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, Toolbar, Button, Chip,
  IconButton, useMediaQuery, Avatar
} from "@mui/material";
import { GlobalStyles } from "@mui/system";
import CollectionsRounded from "@mui/icons-material/CollectionsRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";

import LoginDialog from "../components/LoginDialog";
import { useAuth } from "../stores/auth";
import { useNavigate } from "react-router-dom";

// gallery 데이터
import { getPhotos, type PhotoItem } from "../compat/mediaShim";

/* ===== 색/토큰 ===== */
const NAVY = "#001489";
const ROW_H = 64;
const COLS = {
  checkbox: 72,
  thumb: 84,
  title: 360,
  session: 140,
  date: 152,
  views: 96,
  likes: 96,
};
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

/* ===== 페이지 ===== */
export default function MyMedia() {
  const user = useAuth((s) => s.user);
  const authed = !!user;
  const navigate = useNavigate();

  // 로그인 유도
  const [loginOpen, setLoginOpen] = React.useState(false);
  React.useEffect(() => { if (!authed) setLoginOpen(true); }, [authed]);

  // 내 미디어만 필터: 이메일 우선, 없으면 닉네임 fallback
  const myEmail = (user?.email ?? "").toLowerCase();
  const myName  = (user?.name ?? "").trim().toLowerCase();

  const mineFilter = React.useCallback((p: PhotoItem) => {
    const pe = (p as any).uploaderEmail ? String((p as any).uploaderEmail).toLowerCase() : "";
    const pn = (p as any).uploaderName ? String((p as any).uploaderName).trim().toLowerCase() : "";
    return (myEmail && pe && pe === myEmail) || (!!myName && pn && pn === myName);
  }, [myEmail, myName]);

  // 데이터
  const [rows, setRows] = React.useState<PhotoItem[]>(() =>
    getPhotos().filter(mineFilter).sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO))
  );
  React.useEffect(() => {
    const next = getPhotos().filter(mineFilter).sort((a, b) => +new Date(b.dateISO) - +new Date(a.dateISO));
    setRows(next);
  }, [mineFilter]);

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
      {/* 전용 글로벌 규칙 */}
      <GlobalStyles styles={{
        ".mc-cell": { height: ROW_H, verticalAlign: "middle", paddingTop: 0, paddingBottom: 0 },
        ".mc-check": {
          width: `${COLS.checkbox}px`, minWidth: `${COLS.checkbox}px`, maxWidth: `${COLS.checkbox}px`,
          boxSizing: "border-box", paddingLeft: "20px", paddingRight: "8px", overflow: "visible",
        },
        ".mc-check .MuiCheckbox-root": { margin: 0, padding: 4 },
        "thead .MuiTableCell-head": {
          backgroundColor: "#F7F9FC", fontWeight: 900, color: "#111827",
          borderBottom: "1px solid rgba(17,24,39,.08)", height: ROW_H, verticalAlign: "middle"
        },
        /* ▼ MyMedia 전용: 중앙정렬용 좌우 패딩 제거 */
        ".mm-thumb":  { paddingLeft: 0, paddingRight: 0 },
        ".mm-session":{ paddingLeft: 0, paddingRight: 0 },
        ".mm-date":   { paddingLeft: 0, paddingRight: 0 },
        ".mm-views":  { paddingLeft: 0, paddingRight: 0 },
        ".mm-likes":  { paddingLeft: 0, paddingRight: 0 },
      }} />

      {/* 헤더 + 뒤로가기(설정으로) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CollectionsRounded sx={{ color: NAVY }} />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>내 미디어</Typography>
          <Chip size="small" label="내가 업로드한 이미지" sx={{ ml: 1, fontWeight: 800, bgcolor: "#EEF2FF", color: NAVY }} />
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
                if (id) navigate(`/gallery/${encodeURIComponent(id)}`);
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

                {/* 썸네일 (헤더 중앙) */}
                <TableCell className="mc-cell mm-thumb" sx={{ width: COLS.thumb, minWidth: COLS.thumb }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      썸네일
                    </Typography>
                  </Box>
                </TableCell>

                {/* 제목 (좌측) */}
                <TableCell className="mc-cell" sx={{ width: COLS.title, minWidth: COLS.title }}>
                  제목
                </TableCell>

                {/* 세션/날짜/조회/좋아요 (헤더 중앙) */}
                <TableCell className="mc-cell mm-session" sx={{ width: COLS.session, minWidth: COLS.session }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      세션
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="mc-cell mm-date" sx={{ width: COLS.date, minWidth: COLS.date }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      날짜
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="mc-cell mm-views" sx={{ width: COLS.views, minWidth: COLS.views }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontWeight: 900, color: "#111827", fontSize: 13.5, lineHeight: "18px" }}>
                      조회
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="mc-cell mm-likes" sx={{ width: COLS.likes, minWidth: COLS.likes }}>
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
                  <TableCell colSpan={7} className="mc-cell">
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                        아직 불러올 데이터가 없어요
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        서버 연결 전까지는 데모 형태로만 보여집니다.
                      </Typography>
                      <Button
                        sx={{ mt: 2, borderRadius: 2 }}
                        variant="contained"
                        onClick={() => navigate("/gallery")}
                      >
                        Gallery로 가기
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((p) => {
                  const sel = isSelected(p.id);
                  return (
                    <TableRow
                      key={p.id}
                      hover
                      selected={sel}
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/gallery/${encodeURIComponent(p.id)}`)}
                    >
                      {/* 체크박스 */}
                      <TableCell
                        className="mc-cell mc-check"
                        onClick={(e) => { e.stopPropagation(); toggleOne(p.id); }}
                      >
                        <Checkbox checked={sel} sx={{ "&.Mui-checked": { color: NAVY } }} />
                      </TableCell>

                      {/* 썸네일 (바디 중앙) */}
                      <TableCell className="mc-cell mm-thumb" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          {p.coverUrl ? (
                            <Avatar
                              variant="rounded"
                              src={p.coverUrl}
                              alt={p.gp}
                              sx={{ width: 48, height: 32, borderRadius: 1, boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}
                            />
                          ) : (
                            <Box sx={{
                              width: 48, height: 32,
                              borderRadius: 1, bgcolor: "rgba(17,24,39,.06)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, color: "#6B7280", fontWeight: 800
                            }}>
                              N/A
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      {/* 제목 — 좌측 정렬 */}
                      <TableCell
                        className="mc-cell"
                        title={`${p.gp}${p.circuit ? ` · ${p.circuit}` : ""}`}
                        sx={{ ...ellipsis1, color: NAVY, fontWeight: 800, "&:hover": { textDecoration: "underline" } }}
                      >
                        {p.gp}{p.circuit ? ` · ${p.circuit}` : ""}
                      </TableCell>

                      {/* 세션 — 중앙 */}
                      <TableCell className="mc-cell mm-session" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>{p.session}</Typography>
                        </Box>
                      </TableCell>

                      {/* 날짜 — 중앙 */}
                      <TableCell className="mc-cell mm-date" onClick={(e) => e.stopPropagation()}>
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
                            {koDate(p.dateISO)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* 조회 — 중앙 */}
                      <TableCell className="mc-cell mm-views" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>{p.views ?? 0}</Typography>
                        </Box>
                      </TableCell>

                      {/* 좋아요 — 중앙 */}
                      <TableCell className="mc-cell mm-likes" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Typography sx={{ fontWeight: 800 }}>{p.likes ?? 0}</Typography>
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

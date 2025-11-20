import * as React from "react";
import {
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Pagination,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import ThumbDownAltRounded from "@mui/icons-material/ThumbDownAltRounded";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../stores/auth";
import LoginDialog from "../components/LoginDialog";
import CommentReplies from "../components/CommentReplies";

type Cat = "strategy" | "driver" | "free";
type Comment = {
  id: string;
  author: string;
  authorId: string;
  body: string;
  createdAt: string;
};
type ThreadEx = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  category: Cat;
  comments: Comment[];
  views: number;
  likes?: number;
  dislikes?: number;
};

const STORE_KEY = "apex-forum-threads";
const VOTE_KEY = "apex-forum-user-votes";

const readVotes = (): Record<
  string,
  Record<string, { like: boolean; dislike: boolean }>
> => {
  try {
    const raw = localStorage.getItem(VOTE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
};

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const asStr = (v: any, fb = ""): string =>
  typeof v === "string" && v.length > 0 ? v : fb;
const asArr = (v: any): any[] => (Array.isArray(v) ? v : []);

const normalizeThread = (t: any): ThreadEx => ({
  id: asStr(t?.id, rid()),
  title: asStr(t?.title, ""),
  content: asStr(t?.content, ""),
  author: asStr(t?.author, "anon"),
  authorId: asStr(t?.authorId, "seed@local"),
  createdAt: asStr(t?.createdAt, new Date().toISOString()),
  category: (["strategy", "driver", "free"] as const).includes(t?.category)
    ? t.category
    : "free",
  comments: asArr(t?.comments).map((c: any) => ({
    id: asStr(c?.id, rid()),
    author: asStr(c?.author, "anon"),
    authorId: asStr(c?.authorId, "seed@local"),
    body: asStr(c?.body, ""),
    createdAt: asStr(c?.createdAt, new Date().toISOString()),
  })),
  views: Number.isFinite(+t?.views) ? +t.views : 0,
  likes: Number.isFinite(+t?.likes) ? +t.likes : 0,
  dislikes: Number.isFinite(+t?.dislikes) ? +t.dislikes : 0,
});

export default function ForumThread() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = useAuth((s) => s.user);
  const authed = !!user;
  const isAdmin = useAuth((s) => s.isAdmin);
  const C_PAGE_SIZE = 10;

  // ── 글 데이터 로드 ──
  const [rows, setRows] = React.useState<ThreadEx[]>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(normalizeThread);
      }
    } catch {}
    return [];
  });
  const thread = React.useMemo(() => rows.find((r) => r.id === id), [rows, id]);

  // 조회수 +1
  React.useEffect(() => {
    if (!id) return;
    setRows((prev) => {
      const next = [...prev];
      const idx = next.findIndex((r) => r.id === id);
      if (idx >= 0) next[idx] = { ...next[idx], views: (next[idx].views ?? 0) + 1 };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
  }, [id]);

  // ── 로그인 게이트 ──
  const [loginOpen, setLoginOpen] = React.useState(false);
  const pendingAction = React.useRef<null | (() => void)>(null);
  const requireLoginThen = (action: () => void) => {
    if (authed) action();
    else {
      pendingAction.current = action;
      setLoginOpen(true);
    }
  };
  const handleLoginSuccess = () => {
    if (pendingAction.current) {
      const a = pendingAction.current;
      pendingAction.current = null;
      a();
    }
  };

  // ── 댓글 작성 ──
  const [comment, setComment] = React.useState("");
  const addComment = () => {
    if (!thread || !user) return;
    const text = comment.trim();
    if (!text) return;
    const next: Comment = {
      id: rid(),
      author: user.name,
      authorId: (user.email ?? user.id ?? "local").toLowerCase(),
      body: text,
      createdAt: new Date().toISOString(),
    };
    const updated = rows.map((r) =>
      r.id === thread.id ? { ...r, comments: [...r.comments, next] } : r
    );
    setRows(updated);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    setComment("");
  };

  // ── 권한 ──
  const myId = (user?.email ?? user?.id ?? "").toLowerCase();
  const threadOwner = (thread?.authorId ?? "").toLowerCase();
  const canDeleteThread = isAdmin() || (!!myId && myId === threadOwner);
  const canEditThread = !!myId && myId === threadOwner;

  // ── 글 수정 ──
  const [editOpen, setEditOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");
  const [editContent, setEditContent] = React.useState("");
  React.useEffect(() => {
    if (thread) {
      setEditTitle(thread.title);
      setEditContent(thread.content);
    }
  }, [thread]);
  const saveThread = () => {
    if (!thread || !canEditThread) return;
    const updated = rows.map((r) =>
      r.id === thread.id
        ? { ...r, title: editTitle.trim() || r.title, content: editContent }
        : r
    );
    setRows(updated);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    setEditOpen(false);
  };
  const deleteThread = () => {
    if (!thread || !canDeleteThread) return;
    if (!confirm("이 글을 삭제할까요?")) return;
    const updated = rows.filter((r) => r.id !== thread.id);
    setRows(updated);
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    navigate("/forum");
  };

  // ── 좋아요/싫어요 ──
  const getUserId = () => (user?.email ?? user?.id ?? "guest").toString();

  // 처음 렌더 시점에 localStorage에서 바로 읽어서 초기값으로 넣기
  const [vote, setVote] = React.useState<{ like: boolean; dislike: boolean }>(() => {
    try {
      const all = readVotes();
      const uid = (user?.email ?? user?.id ?? "guest").toString();
      const pid = id?.toString() ?? "";
      return pid && all[uid]?.[pid] ? all[uid][pid] : { like: false, dislike: false };
    } catch {
      return { like: false, dislike: false };
    }
  });
  React.useEffect(() => {
    const all = readVotes();
    const uid = getUserId();
    const pid = id?.toString() ?? "";
    if (!pid) return;
    setVote(all[uid]?.[pid] ?? { like: false, dislike: false });
  }, [id, user?.email, user?.id]);

  const handleVote = (type: "like" | "dislike") => {
    if (!thread) return;

    // 이전 상태
    const prevLike = vote.like;
    const prevDislike = vote.dislike;

    // 최종 상태(상호배타)
    const nextLike = type === "like" ? !prevLike : false;
    const nextDislike = type === "dislike" ? !prevDislike : false;

    // 증감치
    const likeDelta = (nextLike ? 1 : 0) - (prevLike ? 1 : 0);
    const dislikeDelta = (nextDislike ? 1 : 0) - (prevDislike ? 1 : 0);

    // 1) UI 즉시 반영
    setVote({ like: nextLike, dislike: nextDislike });

    // 2) 글 카운트 반영 + 저장
    setRows((prev) => {
      const next = [...prev];
      const idx = next.findIndex((r) => r.id === id);
      if (idx < 0) return prev;

      const t = next[idx];
      next[idx] = {
        ...t,
        likes: Math.max(0, (t.likes ?? 0) + likeDelta),
        dislikes: Math.max(0, (t.dislikes ?? 0) + dislikeDelta),
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });

    // 3) 유저별 투표 저장(영구 유지)
    try {
      const all = readVotes();
      const uid = getUserId();
      const pid = id?.toString() ?? "";
      if (pid) {
        if (!all[uid]) all[uid] = {};
        all[uid][pid] = { like: nextLike, dislike: nextDislike };
        localStorage.setItem(VOTE_KEY, JSON.stringify(all));
      }
    } catch {}
  };

  // ── 댓글 편집/삭제 (작성자만 수정, 작성자/관리자만 삭제) ──
  const composingRef = React.useRef(false);
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editCommentBody, setEditCommentBody] = React.useState("");

  const startEditComment = (cid: string, body: string) => {
    setEditingCommentId(cid);
    setEditCommentBody(body);
  };
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentBody("");
  };
  const saveComment = (cid: string) => {
    if (!thread) return;
    const target = thread.comments.find((c) => c.id === cid);
    if (!target) return;
    const targetOwner = (target.authorId ?? "").toLowerCase();
    const mine = !!myId && myId === targetOwner;
    if (!mine) return;

    const updated = rows.map((r) =>
      r.id === thread.id
        ? {
            ...r,
            comments: r.comments.map((c) =>
              c.id === cid ? { ...c, body: editCommentBody.trim() } : c
            ),
          }
        : r
    );
    setRows(updated);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    } catch {}
    cancelEditComment();
  };

  const deleteComment = (cid: string) => {
    if (!thread) return;
    const target = thread.comments.find((c) => c.id === cid);
    if (!target) return;

    const targetOwner = (target.authorId ?? "").toLowerCase();
    const mine = !!myId && myId === targetOwner;
    if (!(mine || isAdmin())) return;
    if (!confirm("댓글을 삭제할까요?")) return;

    const updated = rows.map((r) =>
      r.id === thread.id
        ? { ...r, comments: r.comments.filter((c) => c.id !== cid) }
        : r
    );
    setRows(updated);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    } catch {}

    // 페이지 보정
    const newCount = (thread?.comments.length ?? 1) - 1;
    const newTotal = Math.max(1, Math.ceil(newCount / C_PAGE_SIZE));
    setCPage((p) => Math.min(p, newTotal));
  };

  // ── 댓글 페이지네이션 ──
  const [cPage, setCPage] = React.useState(1);
  const comments = thread?.comments ?? [];
  const cTotalPages = Math.max(1, Math.ceil(comments.length / C_PAGE_SIZE));
  const cStart = (cPage - 1) * C_PAGE_SIZE;
  const cItems = comments.slice(cStart, cStart + C_PAGE_SIZE);

  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/forum");

  if (!thread) {
    return (
      <Container sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackRounded />} onClick={goBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h6">Thread not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4, pb: { xs: 14, md: 10 } }}>
      <Button startIcon={<ArrowBackRounded />} onClick={goBack} sx={{ mb: 2 }}>
        Back
      </Button>

      {/* 본문 */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2, position: "relative" }}>
        <Stack direction="row" alignItems="start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ pl: 0.75 }}>
              {thread.category.toUpperCase()} · {new Date(thread.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, mb: 1, pl: 1 }}>
              {thread.title}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", pl: 1 }}>
              {thread.content}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, pl: 0.75 }}>
              by {thread.author}
            </Typography>
          </Box>

          {/* 글 수정/삭제 */}
          <Stack direction="row" spacing={0.5}>
            {canEditThread && (
              <IconButton size="small" onClick={() => setEditOpen(true)}>
                <EditRounded />
              </IconButton>
            )}
            {canDeleteThread && (
              <IconButton size="small" color="error" onClick={deleteThread}>
                <DeleteOutlineRounded />
              </IconButton>
            )}
          </Stack>
        </Stack>

        {/* ❤️ 좋아요 / 💔 싫어요 (오른쪽 아래 고정) */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ position: "absolute", bottom: 20, right: 30 }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => requireLoginThen(() => handleVote("like"))}
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: vote.like ? "rgba(220,31,38,0.15)" : "rgba(220,31,38,0.08)",
                transition: "all .25s ease",
                transform: vote.like ? "scale(1.1)" : "scale(1)",
                "&:hover": { bgcolor: "rgba(220,31,38,0.2)", transform: "scale(1.15)" },
                "&:active": { transform: "scale(0.96)" },
              }}
            >
              <FavoriteRounded
                sx={{ fontSize: 28, color: vote.like ? "error.main" : "text.secondary" }}
              />
            </IconButton>
            <Typography fontWeight={700}>{thread.likes ?? 0}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => requireLoginThen(() => handleVote("dislike"))}
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: vote.dislike ? "rgba(0,20,137,0.15)" : "rgba(0,20,137,0.08)",
                transition: "all .25s ease",
                transform: vote.dislike ? "scale(1.1)" : "scale(1)",
                "&:hover": { bgcolor: "rgba(0,20,137,0.18)", transform: "scale(1.15)" },
                "&:active": { transform: "scale(0.96)" },
              }}
            >
              <ThumbDownAltRounded
                sx={{ fontSize: 26, color: vote.dislike ? "primary.main" : "text.secondary" }}
              />
            </IconButton>
            <Typography fontWeight={700}>{thread.dislikes ?? 0}</Typography>
          </Stack>
        </Stack>
      </Paper>

      {/* 댓글 */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Comments ({comments.length})
        </Typography>

        {cItems.length === 0 ? (
          <Typography color="text.secondary">아직 댓글이 없습니다.</Typography>
        ) : (
          cItems.map((c) => {
            const targetOwner = (c.authorId ?? "").toLowerCase();
            const mine = !!myId && myId === targetOwner;
            const editing = editingCommentId === c.id;

            return (
              <Card key={c.id} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 1.5 }, }}>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box sx={{ flex: 1 }}>
                      {/* 작성자 + 날짜 한 줄 */}
                      <Stack direction="row" alignItems="baseline" spacing={1} useFlexGap flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700, pl: 0.75 }}>{c.author}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          · {new Date(c.createdAt).toLocaleString()}
                        </Typography>
                      </Stack>

                      {/* 본문 / 편집 */}
                      {!editing ? (
                        <Typography sx={{ mt: 0.1, whiteSpace: "pre-wrap", pl: 1 }}>
                          {c.body}
                        </Typography>
                      ) : (
                        <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={2}
                            value={editCommentBody}
                            onChange={(e) => setEditCommentBody(e.target.value)}
                            onCompositionStart={() => (composingRef.current = true)}
                            onCompositionEnd={() => (composingRef.current = false)}
                            inputProps={{
                              onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                                const ne = e.nativeEvent as any;
                                if (ne.isComposing || composingRef.current) return;
                                const isEnter =
                                  e.key === "Enter" ||
                                  (e.key === "Process" && (ne.code === "Enter" || ne.keyCode === 13)) ||
                                  ne.keyCode === 13;
                                if (isEnter && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  saveComment(c.id);
                                }
                              },
                            }}
                          />
                          <Button size="small" variant="contained" onClick={() => saveComment(c.id)}>
                            Save
                          </Button>
                          <Button size="small" onClick={cancelEditComment}>
                            Cancel
                          </Button>
                        </Stack>
                      )}

                      {/* 답글 */}
                      <Box sx={{ mt: 0 }}>
                        <CommentReplies
                          threadId={thread.id}
                          commentId={c.id}
                          user={user}
                          isAdmin={isAdmin()}
                          requireLoginThen={requireLoginThen}
                        />
                      </Box>
                    </Box>

                    {/* 우측 액션 */}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {mine && !editing && (
                        <IconButton size="small" onClick={() => startEditComment(c.id, c.body)}>
                          <EditRounded fontSize="small" />
                        </IconButton>
                      )}
                      {(isAdmin() || mine) && !editing && (
                        <IconButton size="small" color="error" onClick={() => deleteComment(c.id)}>
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}

        {cTotalPages > 1 && (
          <Stack alignItems="center">
            <Pagination
              page={cPage}
              count={cTotalPages}
              onChange={(_, p) => setCPage(p)}
              variant="outlined"
              shape="rounded"
            />
          </Stack>
        )}
      </Stack>

      {/* 댓글 입력 */}
      <Stack direction="row" spacing={1} alignItems="stretch">
        <TextField
        fullWidth
        multiline
        minRows={1}
        placeholder="Add a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={() => (composingRef.current = false)}
        onKeyDown={(e) => {
          const ne = e.nativeEvent as any;
          // 한글/일본어 입력 중 엔터 무시
          if (ne.isComposing || composingRef.current) return;

          const isEnter =
            e.key === "Enter" ||
            (e.key === "Process" && (ne.code === "Enter" || ne.keyCode === 13)) ||
            ne.keyCode === 13;

          // Shift+Enter 는 줄바꿈 그대로 통과
          if (isEnter && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            requireLoginThen(addComment); // ← 엔터로 등록
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            py: 2,
          },
        }}
      />
        <Button
          variant="contained"
          onClick={() => requireLoginThen(addComment)}
          sx={{
            borderRadius: 2,
            px: 3,
            height: 56,
            alignSelf: "center",
            minWidth: 110,
          }}
        >
          Comment
        </Button>
      </Stack>

      {/* 글 수정 다이얼로그 */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Edit Thread</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <TextField label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <TextField label="Content" value={editContent} onChange={(e) => setEditContent(e.target.value)} multiline minRows={6} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveThread}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <LoginDialog
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          pendingAction.current = null;
        }}
        onSuccess={handleLoginSuccess}
      />
    </Container>
  );
}

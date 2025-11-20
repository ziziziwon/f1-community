// src/components/CommentReplies.tsx
import * as React from "react";
import {
  Stack,
  Typography,
  Button,
  IconButton,
  Box,
  InputBase,
} from "@mui/material";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditRounded from "@mui/icons-material/EditRounded";

type Reply = {
  id: string;
  author: string;
  authorId: string;
  body: string;
  createdAt: string;
};

type Props = {
  threadId: string;
  commentId: string;
  user: { name: string; email?: string; id?: string } | null | undefined;
  isAdmin: boolean;
  requireLoginThen: (fn: () => void) => void;
};

const REPLIES_KEY = "apex-forum-replies";

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function loadAll(): Record<string, Record<string, Reply[]>> {
  try {
    const raw = localStorage.getItem(REPLIES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, Record<string, Reply[]>>) {
  try {
    localStorage.setItem(REPLIES_KEY, JSON.stringify(data));
  } catch {}
}

export default function CommentReplies({
  threadId,
  commentId,
  user,
  isAdmin,
  requireLoginThen,
}: Props) {
  const [openInput, setOpenInput] = React.useState(false);
  const [showList, setShowList] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [replies, setReplies] = React.useState<Reply[]>([]);

  // 편집 상태
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  const myId = (user?.email ?? user?.id ?? "").toLowerCase();

  React.useEffect(() => {
    const all = loadAll();
    const list = all[threadId]?.[commentId] ?? [];
    setReplies(list);
  }, [threadId, commentId]);

  const persist = (next: Reply[]) => {
    const all = loadAll();
    if (!all[threadId]) all[threadId] = {};
    all[threadId][commentId] = next;
    saveAll(all);
    setReplies(next);
  };

  const addReply = () => {
    if (!user) return;
    const text = value.trim();
    if (!text) return;
    const next: Reply = {
      id: rid(),
      author: user.name,
      authorId: (user.email ?? user.id ?? "local").toLowerCase(),
      body: text,
      createdAt: new Date().toISOString(),
    };
    const updated = [...replies, next];
    persist(updated);
    setValue("");
    if (!showList) setShowList(true);
    setOpenInput(false);
  };

  const deleteReply = (replyId: string) => {
    const target = replies.find((r) => r.id === replyId);
    if (!target) return;
    const owner = (target.authorId ?? "").toLowerCase();
    const can = isAdmin || (!!myId && myId === owner);
    if (!can) return;
    if (!confirm("이 답글을 삭제할까요?")) return;
    persist(replies.filter((r) => r.id !== replyId));
    // 편집 중이던 항목 삭제 시 편집 종료
    if (editingId === replyId) {
      setEditingId(null);
      setEditValue("");
    }
  };

  // 새 답글 입력창: Enter로 등록 (IME 안전)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e as any).nativeEvent?.isComposing) return;
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      requireLoginThen(addReply);
    }
  };

  // 편집 시작/저장/취소
  const startEdit = (r: Reply) => {
    setEditingId(r.id);
    setEditValue(r.body);
  };

  const saveEdit = (replyId: string) => {
    const target = replies.find((r) => r.id === replyId);
    if (!target) return;
    const owner = (target.authorId ?? "").toLowerCase();
    const mine = !!myId && myId === owner;
    if (!mine) return; // 작성자만 편집 허용

    const text = editValue.trim();
    if (!text) {
      // 빈 문자열이면 취소로 처리 (원하면 여기서 삭제 로직으로 바꿀 수도 있음)
      setEditingId(null);
      setEditValue("");
      return;
    }

    const updated = replies.map((r) =>
      r.id === replyId ? { ...r, body: text } : r
    );
    persist(updated);
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // 편집 입력창: Enter로 저장 (IME 안전)
  const onEditKeyDown = (replyId: string) => (e: React.KeyboardEvent) => {
    if ((e as any).nativeEvent?.isComposing) return;
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      saveEdit(replyId);
    }
  };

  return (
    <Stack spacing={1} sx={{ mt: 0 }}>
      {/* action line */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {replies.length > 0 && (
          <Button
            onClick={() => setShowList((v) => !v)}
            size="small"
            variant="text"
            sx={{
              transform: "translateY(2.5px)",
              textTransform: "none",
              px: 0,
              minWidth: 0,
              color: "text.secondary",
              "&:hover": { background: "transparent", color: "text.primary" },
            }}
          >
            {showList ? "Hide replies" : `View replies (${replies.length})`}
          </Button>
        )}

        <Button
          onClick={() => requireLoginThen(() => setOpenInput((v) => !v))}
          size="small"
          variant="text"
          sx={{
            position: "relative",
            left: 6,
            transform: "translateY(2.5px)",
            textTransform: "none",
            px: 0,
            minWidth: 0,
            color: "text.secondary",
            "&:hover": { background: "transparent", color: "text.primary" },
          }}
        >
          {openInput ? "Cancel" : "Reply"}
        </Button>
      </Stack>

      {/* input (toggle) */}
      {openInput && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 1,
            gap: 1,
          }}
        >
          {/* pill input */}
          <Box
            sx={{
              width: { xs: "100%", sm: 520, md: 640 },
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              px: 2,
              py: 0.5,
              bgcolor: "background.paper",
              transition: "border-color .15s ease, box-shadow .15s ease",
              "&:focus-within": {
                borderColor: "grey.400",
                boxShadow: "0 0 0 3px rgba(0,0,0,0.04)",
              },
            }}
          >
            <InputBase
              placeholder="Write a reply"
              fullWidth
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              sx={{
                fontSize: 14,
                lineHeight: 1.4,
                py: 0.5,
              }}
            />
          </Box>

          {/* clean grey button */}
          <Button
            variant="contained"
            onClick={() => requireLoginThen(addReply)}
            size="medium"
            sx={{
              borderRadius: 999,
              px: 2.5,
              height: 40,
              minWidth: 72,
              bgcolor: "grey.900",
              color: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
              "&:hover": {
                bgcolor: "grey.800",
                boxShadow: "0 2px 6px rgba(0,0,0,.12)",
              },
              "&:active": { transform: "translateY(1px)" },
            }}
          >
            Reply
          </Button>
        </Box>
      )}

      {/* replies list */}
      {showList && replies.length > 0 && (
        <Stack spacing={1} sx={{ borderLeft: "2px solid #ECEFF5", pl: 2 }}>
          {replies.map((r) => {
            const mine = !!myId && myId === (r.authorId ?? "").toLowerCase();
            const canDelete = isAdmin || mine; // 관리자/작성자만 삭제
            const canEdit = mine;              // 작성자만 수정

            const isEditing = editingId === r.id;

            return (
              <Stack
                key={r.id}
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={1}
              >
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="baseline"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Typography sx={{ fontWeight: 700 }}>{r.author}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      · {new Date(r.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>

                  {!isEditing ? (
                    <Typography sx={{ pl: 0.7, mt: 0.25, whiteSpace: "pre-wrap" }}>
                      {r.body}
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          px: 1.5,
                          py: 0.25,
                          bgcolor: "background.paper",
                        }}
                      >
                        <InputBase
                          autoFocus
                          fullWidth
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={onEditKeyDown(r.id)}
                          sx={{ fontSize: 14, lineHeight: 1.4, py: 0.5 }}
                          placeholder="Edit reply"
                        />
                      </Box>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => saveEdit(r.id)}
                        sx={{ borderRadius: 999, height: 32, px: 2 }}
                      >
                        Save
                      </Button>
                      <Button size="small" onClick={cancelEdit} sx={{ height: 32 }}>
                        Cancel
                      </Button>
                    </Stack>
                  )}
                </Box>

                {/* 액션: 작성자는 수정/삭제, 관리자는 삭제만 */}
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }}>
                  {canEdit && !isEditing && (
                    <IconButton size="small" onClick={() => startEdit(r)}>
                      <EditRounded fontSize="small" />
                    </IconButton>
                  )}
                  {canDelete && !isEditing && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteReply(r.id)}
                    >
                      <DeleteOutlineRounded fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

import * as React from "react";
import {
  Container,
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import ThumbDownAltRounded from "@mui/icons-material/ThumbDownAltRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPhotos,
  bumpView,
  toggleLike,
  deletePhotoWithProof,
  canDeletePhoto,
  type PhotoItem,
} from "../compat/mediaShim";
import { useAuth } from "../stores/auth";
import { loadImage } from "../utils/useMediaCache";

/* =======================
    좋아요/싫어요 로컬 상태
======================= */
function useLocalVotes() {
  const [votes, setVotes] = React.useState<
    Record<string, { like: boolean; dislike: boolean }>
  >(() => {
    try {
      const raw = localStorage.getItem("gallery-votes");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    localStorage.setItem("gallery-votes", JSON.stringify(votes));
  }, [votes]);

  const api = {
    like: (id: string) =>
      setVotes((prev) => {
        const cur = prev[id] || { like: false, dislike: false };
        return { ...prev, [id]: { like: !cur.like, dislike: false } };
      }),
    dislike: (id: string) =>
      setVotes((prev) => {
        const cur = prev[id] || { like: false, dislike: false };
        return { ...prev, [id]: { like: false, dislike: !cur.dislike } };
      }),
  };

  return { votes, api };
}

/* =======================
    메인 상세 페이지
======================= */
export default function MediaDetail() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const isAdminRaw = useAuth((s) => s.isAdmin);
  const isAdmin = typeof isAdminRaw === "function" ? !!isAdminRaw() : !!isAdminRaw;

  const [items, setItems] = React.useState<PhotoItem[]>(() => getPhotos());
  const photo = items.find((p) => p.id === id);
  const { votes, api } = useLocalVotes();

  /* 이미지 Blob 복원 */
  const [imgSrc, setImgSrc] = React.useState<string | undefined>(
    photo?.coverUrl || undefined
  );

  React.useEffect(() => {
    let revokeUrl: string | null = null;
    (async () => {
      if (!id) return;
      const blobUrl = await loadImage(id);
      if (blobUrl) {
        setImgSrc(blobUrl);
        revokeUrl = blobUrl;
      }
    })();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [id]);

  /*  조회수 반영 + 새로고침 감지 */
  React.useEffect(() => {
    if (id) bumpView(id);
    setItems(getPhotos());
  }, [id]);

  React.useEffect(() => {
    const refresh = () => setItems(getPhotos());
    const onVis = () =>
      document.visibilityState === "visible" && refresh();
    const onFocus = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "apex-media-photos") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const refresh = () => setItems(getPhotos());

  if (!photo) {
    return (
      <Container sx={{ py: 4, pb:"65px" }}>
        <Button startIcon={<ArrowBackRounded />} onClick={() => nav(-1)} sx={{ mb: 2 }}>
          Media
        </Button>
        <Typography>사진을 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  const canRemoveQuick = canDeletePhoto({ isAdmin, currentUser: user, photo });
  const vote = votes[photo.id] || { like: false, dislike: false };

  const onLike = () => {
    const wasLiked = !!votes[photo.id]?.like;
    const delta = wasLiked ? -1 : +1;
    toggleLike(photo.id, delta);
    api.like(photo.id);
    refresh();
  };

  const onDislike = () => {
    api.dislike(photo.id);
    refresh();
  };

  /* 삭제 다이얼로그 */
  const [delOpen, setDelOpen] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const tryDelete = async () => {
    setBusy(true);
    try {
      await deletePhotoWithProof({
        isAdmin,
        currentUser: user,
        photoId: photo.id,
        passwordPlain: canRemoveQuick ? undefined : pw.trim(),
      });
      setDelOpen(false);
      nav("/gallery");
    } catch (e: any) {
      const code = String(e?.message || e);
      const msg =
        code === "bad_credentials"
          ? "비밀번호가 올바르지 않습니다."
          : code === "need_credentials"
          ? "비밀번호를 입력해 주세요."
          : code === "no_guest_protection"
          ? "게스트 보호 비밀번호가 설정되지 않은 항목입니다."
          : "삭제할 수 없습니다.";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  /* =======================
      Render
  ======================= */
  return (
    <Container sx={{ py: 4, pb:"65px" }}>
      <Button startIcon={<ArrowBackRounded />} onClick={() => nav(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {/*  이미지 */}
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,.06)",
          mb: 2,
        }}
      >
        <img
          src={imgSrc || photo.coverUrl}
          alt={photo.gp}
          style={{
            width: "100%",
            display: "block",
            aspectRatio: "16 / 9",
            objectFit: "cover",
          }}
        />
      </Box>

      {/*  메타 정보 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {photo.gp}
            {photo.circuit ? ` · ${photo.circuit}` : ""}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip label={`${photo.country} R${photo.round}`} />
            <Chip label={photo.session} />
            <Chip
              label={new Date(photo.dateISO).toLocaleDateString()}
              sx={{ color: "text.secondary" }}
            />
            {photo.tags?.slice(0, 3).map((t) => (
              <Chip key={t} label={t} />
            ))}

            {/*  by Guest  */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ alignSelf: "center", ml: 1 }}
            >
              {photo.uploaderName
                ? `by ${photo.uploaderName}`
                : "by Guest"}{" "}
              · likes {photo.likes ?? 0}
            </Typography>
          </Stack>
        </Box>

        {/*  조회수 / 좋아요·싫어요 / 삭제 */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* 조회수 */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.55,
              borderRadius: 999,
              bgcolor: "rgba(0,0,0,0.06)",
              border: "1px solid rgba(17,24,39,.08)",
              boxShadow: "0 1px 0 rgba(0,0,0,.03) inset",
              lineHeight: 1,
            }}
            aria-label="조회수"
            title="조회수"
          >
            <VisibilityRounded
              sx={{ fontSize: 20, mr: 0.5, color: "text.secondary" }}
            />
            <Typography sx={{ fontWeight: 800 }}>
              {photo.views ?? 0}
            </Typography>
          </Box>

          {/* 좋아요/싫어요 */}
          <Box
            sx={{
              ml: 2,
              pl: 2,
              borderLeft: "1px solid rgba(17,24,39,.12)",
              display: "flex",
              alignItems: "center",
              columnGap: 1.5,
            }}
          >
            {/* ❤️ 좋아요 */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                onClick={onLike}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: vote.like
                    ? "rgba(220,31,38,0.15)"
                    : "rgba(220,31,38,0.08)",
                  transition: "all .25s ease",
                  transform: vote.like ? "scale(1.1)" : "scale(1)",
                  "&:hover": {
                    bgcolor: "rgba(220,31,38,0.2)",
                    transform: "scale(1.15)",
                    boxShadow: "0 4px 10px rgba(220,31,38,0.25)",
                  },
                  "&:active": { transform: "scale(0.96)" },
                }}
              >
                <FavoriteRounded
                  sx={{
                    fontSize: 28,
                    color: vote.like ? "error.main" : "text.secondary",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                  }}
                />
              </IconButton>
              <Typography fontWeight={700}>{photo.likes ?? 0}</Typography>
            </Stack>

            {/* 💔 싫어요 */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                onClick={onDislike}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: vote.dislike
                    ? "rgba(0,20,137,0.15)"
                    : "rgba(0,20,137,0.08)",
                  transition: "all .25s ease",
                  transform: vote.dislike ? "scale(1.1)" : "scale(1)",
                  "&:hover": {
                    bgcolor: "rgba(0,20,137,0.18)",
                    transform: "scale(1.15)",
                    boxShadow: "0 4px 10px rgba(0,20,137,0.25)",
                  },
                  "&:active": { transform: "scale(0.96)" },
                }}
              >
                <ThumbDownAltRounded
                  sx={{
                    fontSize: 26,
                    color: vote.dislike ? "primary.main" : "text.secondary",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                  }}
                />
              </IconButton>
              <Typography fontWeight={700}>
                {vote.dislike ? 1 : 0}
              </Typography>
            </Stack>
          </Box>

          {/* 삭제 */}
          <Box
            sx={{
              ml: 2,
              pl: 2,
              borderLeft: "1px solid rgba(17,24,39,.12)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              color="error"
              onClick={() => setDelOpen(true)}
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "rgba(0,0,0,0.04)",
                transition: "all .25s ease",
                "&:hover": {
                  bgcolor: "rgba(220,31,38,0.12)",
                  transform: "scale(1.1)",
                },
                "&:active": { transform: "scale(0.95)" },
              }}
              aria-label="삭제"
              title="삭제"
            >
              <DeleteOutlineRounded sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>
        </Stack>
      </Stack>

      {/* 삭제 다이얼로그 */}
      <Dialog open={delOpen} onClose={() => setDelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>사진 삭제</DialogTitle>
        <DialogContent>
          {canRemoveQuick ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              관리자 또는 작성자 권한으로 삭제합니다. 진행할까요?
            </Typography>
          ) : (
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                본인 확인을 위해 <b>비밀번호</b> 입력 후 삭제됩니다.
              </Typography>
              <TextField
                label="비밀번호"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelOpen(false)}>취소</Button>
          <Button
            variant="contained"
            color="error"
            disabled={busy}
            onClick={tryDelete}
          >
            {canRemoveQuick ? "바로 삭제" : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

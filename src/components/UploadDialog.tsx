import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Box, TextField, Button, IconButton,
  useMediaQuery, CircularProgress, Typography, Fade
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRounded from "@mui/icons-material/CloseRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import AddPhotoAlternateRounded from "@mui/icons-material/AddPhotoAlternateRounded";
import { addPhoto, type AddPhotoInput, type SessionType } from "../compat/mediaShim";

export default function UploadDialog({
  open, onClose, onSubmit, authed,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddPhotoInput, file: File) => Promise<void>;
  authed: boolean;
}) {
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("sm"));
  const fileInputId = React.useId();

  // 폼 상태
  const [gp, setGp] = React.useState("");
  const [country, setCountry] = React.useState("🏁");
  const [circuit, setCircuit] = React.useState("");
  const [session, setSession] = React.useState<SessionType>("Race");
  const [dateISO, setDateISO] = React.useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [tags, setTags] = React.useState("");
  const [file, setFile] = React.useState<File | undefined>();
  const [preview, setPreview] = React.useState<string | undefined>();
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const reset = () => {
    setGp("");
    setCountry("🏁");
    setCircuit("");
    setSession("Race");
    setDateISO(new Date().toISOString().slice(0, 10));
    setTags("");
    setFile(undefined);
    setPreview(undefined);
    setPw("");
  };

  // 파일 선택
  const onPick = (f?: File) => {
    if (!f) return;
    if (!/^image\/(jpe?g|png|webp)$/i.test(f.type))
      return alert("JPG, PNG, WEBP만 업로드 가능");
    if (f.size > 10 * 1024 * 1024) return alert("최대 10MB까지 업로드 가능");

    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // ✅ 업로드 실행
  const handleSubmit = async () => {
    if (!gp.trim()) return alert("그랑프리 이름을 입력하세요.");
    if (!file || !preview) return alert("커버 이미지를 첨부하세요.");
    if (!authed && pw.trim().length < 4)
      return alert("비회원 비밀번호는 4자 이상이어야 합니다.");

    setBusy(true);
    try {
      const payload: AddPhotoInput = {
        gp: gp.trim(),
        round: 0,
        country,
        circuit,
        session,
        dateISO,
        count: 1,
        coverUrl: preview, // Base64 저장
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        deletePasswordPlain: authed ? undefined : pw.trim(),
      };

      // ⚡ 실제 저장
      await addPhoto(payload);
      await onSubmit(payload, file);

      reset();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!busy ? onClose : undefined}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* ===== Header ===== */}
      <DialogTitle
        sx={{
          fontWeight: 900,
          color: "#001489",
          letterSpacing: "-0.02em",
          pr: 5,
        }}
      >
        Upload Photo
        <IconButton
          onClick={() => {
            if (!busy) {
              reset();
              onClose();
            }
          }}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      {/* ===== Content ===== */}
      <DialogContent dividers sx={{ bgcolor: "rgba(255,255,255,0.5)" }}>
        <Stack spacing={2}>
          {/* 이미지 선택 박스 */}
          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onPick(e.dataTransfer.files?.[0]);
            }}
            onClick={() =>
              document.getElementById(fileInputId)?.click()
            }
            sx={{
              border: `2px dashed rgba(0,0,0,0.15)`,
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "rgba(250,250,252,0.6)",
              cursor: "pointer",
              transition: "all .25s ease",
              "&:hover": {
                borderColor: "#001489",
                bgcolor: "rgba(0,20,137,0.04)",
              },
            }}
          >
            {preview ? (
              <Fade in>
                <Box
                  component="img"
                  src={preview}
                  alt="preview"
                  sx={{
                    width: "100%",
                    height: small ? 180 : 220,
                    objectFit: "cover",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
              </Fade>
            ) : (
              <Stack alignItems="center" spacing={1.2}>
                <CloudUploadRounded fontSize="large" color="action" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  이미지를 드래그하거나 클릭하여 선택
                  <br />
                  (JPG/PNG/WEBP, ≤10MB)
                </Typography>
              </Stack>
            )}
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPick(e.target.files?.[0])}
            />
          </Box>

          {/* 메타데이터 필드 */}
          <TextField
            label="그랑프리 이름"
            value={gp}
            onChange={(e) => setGp(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="국가 (이모지 가능)"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            fullWidth
          />
          <TextField
            label="서킷명 (선택)"
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            fullWidth
          />
          <TextField
            label="태그 (쉼표 , 구분)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
          />

          {!authed && (
            <TextField
              label="삭제용 비밀번호 (비회원 필수)"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              fullWidth
              required
            />
          )}
        </Stack>
      </DialogContent>

      {/* ===== Actions ===== */}
      <DialogActions sx={{ py: 2, px: 3 }}>
        <Button onClick={() => !busy && onClose()}>취소</Button>
        <Button
          variant="contained"
          disableElevation
          startIcon={
            busy ? <CircularProgress size={18} /> : <AddPhotoAlternateRounded />
          }
          disabled={busy}
          onClick={handleSubmit}
          sx={{
            fontWeight: 800,
            bgcolor: "#DA291C",
            "&:hover": { bgcolor: "#b71c1c" },
            borderRadius: 9999,
            px: 3,
          }}
        >
          업로드
        </Button>
      </DialogActions>
    </Dialog>
  );
}

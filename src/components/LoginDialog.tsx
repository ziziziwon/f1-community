import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, InputAdornment
} from "@mui/material";
import EmailRounded from "@mui/icons-material/EmailRounded";
import KeyRounded from "@mui/icons-material/KeyRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useAuth } from "../stores/auth";       
import type { User, Role } from "../stores/auth";
import { ADMIN_EMAILS } from "../stores/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// 안전한 랜덤 id
const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function LoginDialog({ open, onClose, onSuccess }: Props) {
  const setUser = useAuth((s) => s.setUser);    // ✅ login이 아니라 setUser 사용 (스토어에 맞춰주세요)

  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    const eNorm = email.trim().toLowerCase();

    if (!/^[^@]+@[^@]+\.[^@]+$/.test(eNorm) || pw.trim().length < 4) {
      alert("이메일 형식 또는 비밀번호(4자 이상)를 확인하세요.");
      return;
    }

    setBusy(true);
    try {
      const role: Role = ADMIN_EMAILS.includes(eNorm) ? "admin" : "user";
      const user: User = {
        id: rid(),
        name: eNorm.split("@")[0] || "user",
        email: eNorm,
        role,                              
      };

      // 스토어 저장
      setUser(user);

      onClose();
      onSuccess?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleLogin}>
        <DialogTitle sx={{ fontWeight: 900 }}>로그인</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRounded />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="비밀번호"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              helperText="데모: 아무 이메일 + 비밀번호 4자 이상이면 로그인됩니다."
              disabled={busy}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyRounded />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} startIcon={<CloseRounded />} disabled={busy}>
            취소
          </Button>
          <Button variant="contained" type="submit" disabled={busy}>
            {busy ? "로그인 중…" : "로그인"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

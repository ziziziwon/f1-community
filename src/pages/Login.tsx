import * as React from "react";
import {
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../stores/auth";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; type: "success" | "error" }>({
    open: false,
    msg: "",
    type: "success",
  });

  const navigate = useNavigate();
  const setUser = useAuth((s) => s.setUser);

  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setSnack({ open: true, msg: "올바른 이메일 형식을 입력하세요.", type: "error" });
      return;
    }
    if (pw.length < 4) {
      setSnack({ open: true, msg: "비밀번호는 4자 이상이어야 합니다.", type: "error" });
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 1200)); // 로딩 시뮬레이션

    const username = email.split("@")[0];
    setUser({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: username,
      email,
      role: "user",
    });

    if (remember) localStorage.setItem("remember_email", email);
    else localStorage.removeItem("remember_email");

    setSnack({ open: true, msg: `⚡ Welcome back, ${username}!`, type: "success" });
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1200);
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);


  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        py: 8,               
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          borderRadius: 5,
          textAlign: "center",
          width: "100%",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,245,255,0.9))",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 2,
            color: "#001489",
            letterSpacing: 0.5,
          }}
        >
          APEX CHARGE
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4, color: "#001489b3" }}>
          Push to the Limit ⚡ Red Bull Spirit 로그인
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="비밀번호"
            type={showPw ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw(!showPw)}>
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            }
            label="나를 기억하기"
            sx={{
              color: "#001489b3",
              fontWeight: 500,
              justifyContent: "flex-start",
              alignSelf: "flex-start",
            }}
          />

          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              fontWeight: 900,
              py: 1.5,
              borderRadius: "40px",
              background:
                "linear-gradient(90deg, #001489, #DA291C 60%, #FFD100 100%)",
              backgroundSize: "200% 100%",
              backgroundPosition: "0% 0%",
              boxShadow: "0 6px 16px rgba(0,20,137,0.35)",
              transition: "all .4s ease",
              "&:hover": {
                backgroundPosition: "100% 0%",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 25px rgba(218,41,28,0.45)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "로그인"
            )}
          </Button>

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: "#555",
              fontWeight: 500,
            }}
          >
            계정이 없나요?{" "}
            <Button
              variant="text"
              sx={{
                color: "#001489",
                fontWeight: 800,
                ml: 0.5,
                textDecoration: "underline",
              }}
              onClick={() => alert("회원가입은 현재 준비 중입니다.")}
            >
              회원가입
            </Button>
          </Typography>
        </Stack>
      </Paper>

      {/* 스낵바 피드백 */}
      <Snackbar
        open={snack.open}
        autoHideDuration={1500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          sx={{
            background:
              snack.type === "success"
                ? "linear-gradient(135deg, #001489, #DA291C 80%, #FFD100)"
                : undefined,
            fontWeight: 900,
            color: "#fff",
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

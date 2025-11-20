// src/theme.ts
import * as muiStyles from "@mui/material/styles";

const { createTheme, alpha } = muiStyles;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#001489" },     // Red Bull Blue (포인트)
    secondary: { main: "#DA291C" },   // CTA Red
    warning: { main: "#FFD100" },     // Highlight Yellow
    background: {
      default: "#F7F8FB",             // 페이지 배경 (밝은 회백색)
      paper: "#FFFFFF",               // 카드/패널 배경
    },
    text: {
      primary: "#111827",             // 거의 블랙
      secondary: "#6B7280",           // 중간 회색
    },
    divider: "#E5E7EB",               // 라이트 그레이 보더
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      "Pretendard Variable","Inter","system-ui","-apple-system","Segoe UI",
      "Roboto","Noto Sans KR","Apple SD Gothic Neo","sans-serif",
    ].join(","),
    h3: { fontWeight: 900, letterSpacing: -0.2, lineHeight: 1.1 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontSize: "15px", letterSpacing: 0, backgroundColor: "#F7F8FB" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#111827",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 0 rgba(17,24,39,.04)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px rgba(17,24,39,.04)",
        },
      },
      defaultProps: { elevation: 0 },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px rgba(17,24,39,.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 14,
          paddingBlock: 10,
          boxShadow: "none",
          "&.MuiButton-containedSecondary:hover": {
            transform: "translateY(-1px)",
            boxShadow: `0 6px 20px ${alpha("#DA291C", 0.2)}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: "1px solid #E5E7EB",
          backgroundColor: "#F3F4F6", // 라이트 그레이 칩
        },
        label: { fontWeight: 700 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 2, borderRadius: 1, backgroundColor: "#001489" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          color: alpha("#111827", 0.7),
          fontWeight: 800,
          "&.Mui-selected": { color: "#111827" },
        },
      },
    },
  },
});

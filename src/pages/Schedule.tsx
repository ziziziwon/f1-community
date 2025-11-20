import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Chip,
  useTheme,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import FlagRounded from "@mui/icons-material/FlagRounded";

type Session = {
  type: string;
  date: string;
  time?: string;
  name: string;
  country: string;
  circuit: string;
};

type Race = {
  raceName: string;
  date: string;
  time?: string;
  Circuit: { circuitName: string; Location: { country: string } };
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
};

import { getApiBase } from "../utils/apiBase";

export default function ScheduleCalendar() {
  const theme = useTheme();
  const [races, setRaces] = React.useState<Race[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
  const [year, _setYear] = React.useState<number>(new Date().getFullYear());
  const [selectedWeekday, setSelectedWeekday] = React.useState<number | null>(null);

  React.useEffect(() => {
  const API_BASE = import.meta.env.VITE_API_BASE || getApiBase() || "https://ergast.com/api/f1";
    const endpoint = `${API_BASE}/${year}.json`;
    setLoading(true);
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setRaces(data?.MRData?.RaceTable?.Races || []))
      .finally(() => setLoading(false));
  }, [year]);

  /** 세션 구성 */
  const sessions = React.useMemo<Session[]>(() => {
    const list: Session[] = [];
    races.forEach((r) => {
      const base = {
        name: r.raceName,
        circuit: r.Circuit?.circuitName,
        country: r.Circuit?.Location?.country,
      };
      const add = (type: string, s?: { date: string; time?: string }) =>
        s && list.push({ ...base, type, date: s.date, time: s.time });
      add("Practice 1", r.FirstPractice);
      add("Practice 2", r.SecondPractice);
      add("Practice 3", r.ThirdPractice);
      add("Qualifying", r.Qualifying);
      add("Sprint", r.Sprint);
      add("Race", { date: r.date, time: r.time });
    });
    return list;
  }, [races]);

  /** theme 기반 색상 */
  const badgeColor = (type: string) => {
    const { primary, secondary, warning, text } = theme.palette;
    switch (true) {
      case type.includes("Practice"):
        return { bg: primary.main + "10", color: primary.main };
      case type.includes("Qualifying"):
        return { bg: text.secondary + "15", color: text.secondary };
      case type.includes("Sprint"):
        return { bg: warning.main + "15", color: warning.main };
      case type.includes("Race"):
        return { bg: secondary.main + "15", color: secondary.main };
      default:
        return { bg: "#F3F4F6", color: "#111827" };
    }
  };

  /** 월별 + 요일 필터 */
  const filteredByMonth = sessions.filter(
    (s) => new Date(s.date).getMonth() + 1 === month
  );
  const filtered = filteredByMonth.filter((s) =>
    selectedWeekday === null ? true : new Date(s.date).getDay() === selectedWeekday
  );

  /** 날짜별 그룹화 */
  const grouped = filtered.reduce((acc: Record<string, Session[]>, cur) => {
    acc[cur.date] = acc[cur.date] || [];
    acc[cur.date].push(cur);
    return acc;
  }, {});
  const days = Object.keys(grouped).sort();
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  /** 다음 세션 찾기 */
  const now = new Date();
  const nextSession = React.useMemo(() => {
    const future = sessions
      .map((s) => {
        const dt = new Date(`${s.date}T${s.time || "00:00"}`);
        return { ...s, timestamp: dt.getTime() };
      })
      .filter((s) => s.timestamp > now.getTime())
      .sort((a, b) => a.timestamp - b.timestamp);
    return future[0] || null;
  }, [sessions]);

  const handleWeekdayClick = (idx: number) => {
    setSelectedWeekday((prev) => (prev === idx ? null : idx));
  };

  return (
    <Container sx={{ py: 4, pb: 8 }}>
      <Box sx={{ maxWidth: "960px", mx: "auto" }}>
        {/* 헤더 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarMonthRounded sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {year}년 {month}월 경기 일정
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setMonth((m) => (m > 1 ? m - 1 : 12))}>
              <ChevronLeftRounded />
            </IconButton>
            <IconButton onClick={() => setMonth((m) => (m < 12 ? m + 1 : 1))}>
              <ChevronRightRounded />
            </IconButton>
          </Stack>
        </Box>

        {/* 요일 클릭 영역 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            alignItems: "end",
            mb: 1,
            textAlign: "center",
          }}
        >
          {weekdayLabels.map((label, idx) => {
            const active = selectedWeekday === idx;
            return (
              <Box
                key={label}
                onClick={() => handleWeekdayClick(idx)}
                sx={{
                  py: 1,
                  cursor: "pointer",
                  fontWeight: active ? 900 : 600,
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "25%",
                    right: "25%",
                    bottom: -6,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: active
                      ? theme.palette.primary.main
                      : "transparent",
                  },
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading && (
          <Stack alignItems="center" py={5}>
            <CircularProgress color="primary" />
          </Stack>
        )}

        {!loading &&
          days.map((d) => {
            const dateObj = new Date(d);
            const isToday =
              dateObj.toDateString() === new Date().toDateString();

            const dateStr = dateObj.toLocaleDateString("ko-KR", {
              month: "long",
              day: "numeric",
              weekday: "short",
            });

            return (
              <Box
                key={d}
                sx={{
                  mb: 3,
                  backgroundColor: isToday
                    ? theme.palette.primary.main + "08"
                    : "transparent",
                  borderRadius: 3,
                  p: isToday ? 1.2 : 0,
                  transition: "background-color .3s",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.1rem",
                    color: isToday
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  {dateStr}
                  {isToday && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        ml: 1,
                        color: theme.palette.secondary.main,
                      }}
                    >
                      ● Today
                    </Typography>
                  )}
                </Typography>

                <Stack spacing={1}>
                  {grouped[d].map((s, i) => {
                    const { bg, color } = badgeColor(s.type);
                    const isNext =
                      nextSession &&
                      s.name === nextSession.name &&
                      s.type === nextSession.type &&
                      s.date === nextSession.date;

                    return (
                      <Paper
                        key={`${s.type}-${i}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 2.2,
                          py: 1.2,
                          borderRadius: theme.shape.borderRadius,
                          border: `1px solid ${theme.palette.divider}`,
                          transition: "0.25s ease",
                          boxShadow: isNext
                            ? `0 0 20px ${theme.palette.primary.main}55`
                            : "none",
                          "&:hover": {
                            borderColor: color,
                            boxShadow: `0 4px 12px ${color}25`,
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Chip
                            label={s.type}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              backgroundColor: bg,
                              color,
                              borderRadius: "8px",
                              px: 0.5,
                            }}
                          />
                          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {s.name}
                          </Typography>
                        </Stack>

                        <Stack alignItems="flex-end" spacing={0.3}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              color: theme.palette.text.primary,
                            }}
                          >
                            {s.time ? s.time.slice(0, 5) : "시간 미정"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <FlagRounded sx={{ fontSize: 15, opacity: 0.6 }} />
                            {s.country} · {s.circuit}
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
      </Box>
    </Container>
  );
}

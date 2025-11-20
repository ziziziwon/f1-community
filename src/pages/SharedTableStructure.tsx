import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import BoltRounded from "@mui/icons-material/BoltRounded"
import { TEAM_DATA } from "./teams";

type DriversTableRow = {
  rank: number;
  name: string;
  teamKey: keyof typeof TEAM_DATA;
  points: number;
  podiums: number;
  fastest?: string;
};
type ConstructorsTableRow = {
  rank: number;
  teamKey: keyof typeof TEAM_DATA;
  points: number;
  podiums: number;
  wins: number;
};
type RacesTableRow = {
  rank: number;
  name: string;
  winner: string;
  fastest: string;
};

type Props = {
  rows: (DriversTableRow | ConstructorsTableRow | RacesTableRow)[];
  type: "drivers" | "constructors" | "races";
};

export default function TableStructure({ rows, type }: Props) {
  if (type === "drivers") {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)", width: 84, pl: 2 }}>순위</TableCell>
              <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>드라이버 / 팀</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>포인트</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>포디움</TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>패스트랩</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows as DriversTableRow[]).map((r, i) => {
              const odd = i % 2 === 1;
              const bg = odd ? "rgba(2,6,23,.02)" : "#fff";
              const t = TEAM_DATA[r.teamKey];
              return (
                <TableRow key={i} hover sx={{ background: bg, "&:hover": { background: "rgba(0,20,137,.05)" } }}>
                  <TableCell sx={{ pl: 2 }}>
                    <Chip label={`#${r.rank}`} size="small" sx={{ fontWeight: 900, bgcolor: r.rank===1 ? "#FFD54F" : r.rank===2 ? "#E0E0E0" : r.rank===3 ? "#D7A86E" : "#ECEFF1", color: r.rank<=3 ? (r.rank===1 ? "#3d2e00" : r.rank===2 ? "#222" : "#2b1906") : "#37474F", minWidth: 44 }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      {t.logo && (
                        <img src={t.logo} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "contain" }} />
                      )}
                      <Box>
                        <Typography sx={{ fontWeight: 900 }}>{r.name}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{t.name}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 900, color: t.color }}>{r.points} pts</Typography>
                  </TableCell>
                  <TableCell align="right">{r.podiums}</TableCell>
                  <TableCell align="center">
                    {r.fastest ? (
                      <Chip icon={<BoltRounded sx={{ fontSize: 16 }} />} label={r.fastest} size="small" sx={{ bgcolor: "error.main", color: "#fff", fontWeight: 900, "& .MuiChip-icon": { color: "#fff" } }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }

  if (type === "constructors") {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)", width: 84, pl: 2 }}>순위</TableCell>
              <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>팀</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>포인트</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>포디움</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>우승</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows as ConstructorsTableRow[]).map((r, i) => {
              const odd = i % 2 === 1;
              const bg = odd ? "rgba(2,6,23,.02)" : "#fff";
              const t = TEAM_DATA[r.teamKey];
              return (
                <TableRow key={i} hover sx={{ background: bg, "&:hover": { background: "rgba(0,20,137,.05)" } }}>
                  <TableCell sx={{ pl: 2 }}>
                    <Chip label={`#${r.rank}`} size="small" sx={{ fontWeight: 900, bgcolor: r.rank===1 ? "#FFD54F" : r.rank===2 ? "#E0E0E0" : r.rank===3 ? "#D7A86E" : "#ECEFF1", color: r.rank<=3 ? (r.rank===1 ? "#3d2e00" : r.rank===2 ? "#222" : "#2b1906") : "#37474F", minWidth: 44 }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      {t.logo && (
                        <img src={t.logo} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                      )}
                      <Typography sx={{ fontWeight: 900 }}>{t.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 900, color: t.color }}>{r.points} pts</Typography>
                  </TableCell>
                  <TableCell align="right">{r.podiums}</TableCell>
                  <TableCell align="right">{(rows as ConstructorsTableRow[])[i].wins}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );
  }

  // type === "races"
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
      <Table size="medium" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)", width: 84, pl: 2 }}>라운드</TableCell>
            <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>그랑프리</TableCell>
            <TableCell sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>우승</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900, color: "text.secondary", bgcolor: "rgba(2,6,23,.04)" }}>패스트랩</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rows as RacesTableRow[]).map((r, i) => {
            const odd = i % 2 === 1;
            const bg = odd ? "rgba(2,6,23,.02)" : "#fff";
            return (
              <TableRow key={i} hover sx={{ background: bg, "&:hover": { background: "rgba(0,20,137,.05)" } }}>
                <TableCell sx={{ pl: 2 }}>
                  <Chip size="small" label={`R${r.rank}`} sx={{ fontWeight: 900 }} />
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.winner}</TableCell>
                <TableCell align="right">
                  <Chip icon={<BoltRounded sx={{ fontSize: 16 }} />} label={r.fastest} size="small" sx={{ fontWeight: 900 }} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

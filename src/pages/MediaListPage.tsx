import * as React from "react";
import {
  Container, Box, Card, CardActionArea, CardMedia,
  Chip, Typography, Button, TextField, InputAdornment,
  Pagination,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import AddPhotoAlternateRounded from "@mui/icons-material/AddPhotoAlternateRounded";
import FlagRounded from "@mui/icons-material/FlagRounded";
import { useNavigate } from "react-router-dom";
import { getPhotos, addPhoto, type PhotoItem } from "../compat/mediaShim";
import UploadDialog from "../components/UploadDialog";
import { useAuth } from "../stores/auth";
import { useMediaStore } from "../stores/media"; 

/* ===== 팔레트 ===== */
const PAL = {
  surf: "#f6f7f9",
  brand: "#001489",
  red: "#DA291C",
  redHover: "#b71c1c",
};

/* ===== 날짜 포맷 ===== */
function formatMD(iso: string) {
  const d = new Date(iso);
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${m}/${day}`;
}

/* ===== 카드 ===== */
function SimpleCard({ item }: { item: PhotoItem }) {
  const nav = useNavigate();
  const dateLabel = formatMD(item.dateISO);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "#fff",
        boxShadow: "0 4px 18px rgba(10,15,28,.10)",
        transition: "transform .18s ease, box-shadow .18s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 28px rgba(10,15,28,.14)",
        },
      }}
    >
      <CardActionArea
        onClick={() => nav(`/gallery/${item.id}`)}
        sx={{ position: "relative", p: 0, display: "block", height: "auto" }}
      >
        <CardMedia
          component="img"
          image={item.coverUrl}
          alt={item.gp}
          sx={{
            width: "100%",
            height: "auto",
            aspectRatio: "16/9",
            objectFit: "cover",
            display: "block",
            transition: "transform .25s ease",
            "&:hover": { transform: "scale(1.02)" },
          }}
        />

        <Chip
          label={dateLabel}
          size="small"
          sx={{
            position: "absolute",
            left: 12,
            top: 12,
            bgcolor: "rgba(255,255,255,.96)",
            fontWeight: 800,
            borderRadius: 9999,
            height: 26,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(0,0,0,.55) 100%)",
          }}
        />

        <Typography
          sx={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 14,
            color: "#fff",
            fontWeight: 900,
            lineHeight: 1.15,
            textShadow: "0 1px 2px rgba(0,0,0,.35)",
          }}
        >
          {item.gp}
          {item.circuit ? ` · ${item.circuit}` : ""}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

/* ===== 페이지 ===== */
export default function MediaListPage() {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<PhotoItem[]>(() => getPhotos());
  const user = useAuth((s) => s.user);
  const setPhotos = useMediaStore((s) => s.setPhotos); // ✅ 추가 (Home 하이라이트용)

  const perPage = 6;
  const [page, setPage] = React.useState(1);
  const handleChangePage = (_: any, value: number) => setPage(value);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      `${it.gp} ${it.circuit ?? ""}`.toLowerCase().includes(s)
    );
  }, [items, q]);

  const paginated = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  return (
    <Box
      sx={{
        minHeight: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        bgcolor: PAL.surf,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        sx={{
          pt: 4,
          pb: { xs: 10, md: 8 },
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "auto 1fr auto" },
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <FlagRounded sx={{ color: PAL.brand, fontSize: 40 }} />

          <TextField
            placeholder="Search photos by GP, circuit, or country"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            sx={{
              maxWidth: 880,
              "& .MuiOutlinedInput-root": {
                height: 52,
                borderRadius: 9999,
                bgcolor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            disableElevation
            startIcon={<AddPhotoAlternateRounded />}
            sx={{
              bgcolor: PAL.red,
              "&:hover": { bgcolor: PAL.redHover },
              fontWeight: 800,
              borderRadius: 9999,
              height: 52,
              px: 3,
            }}
            onClick={() => setOpen(true)}
          >
            Upload
          </Button>
        </Box>

        {/* 카드 그리드 */}
        <Box
          sx={{
            flexGrow: 1,
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {paginated.map((it) => (
            <SimpleCard key={it.id} item={it} />
          ))}
        </Box>

        {/* 페이지네이션 */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={Math.ceil(filtered.length / perPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
          />
        </Box>
      </Container>

      {/* 업로드 다이얼로그 */}
      <UploadDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async (payload, _file) => {
          await addPhoto(payload);
          setItems(getPhotos());
          setPhotos(getPhotos()); // Home 하이라이트 동기화
        }}
        authed={!!user}
      />
    </Box>
  );
}

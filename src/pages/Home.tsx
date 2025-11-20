import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIosRounded from "@mui/icons-material/ArrowForwardIosRounded";
import WhatshotRounded from "@mui/icons-material/WhatshotRounded";
import CameraAltRounded from "@mui/icons-material/CameraAltRounded";
import NeonCard from "../components/NeonCard";
import { SITE_NAME } from "../config";
import { useCommunityStore } from "../stores/community";
import NextRaceCard from "../components/NextRaceCard";
import LastRaceTop3 from "../components/LastRaceTop3";
import SessionRail from "../components/SessionRail";
import { useMediaStore } from "../stores/media";
import { useEffect, useMemo, useState } from "react";
import { loadImage } from "../utils/useMediaCache";
import { getPhotos } from "../compat/mediaShim"; 

const useNav = () => {
  const nav = useNavigate();
  return {
    toCommunity: () => nav("/forum"),
    toGallery: () => nav("/gallery"),
    toSchedule: () => nav("/schedule"),
    toResults: () => nav("/results"),
    toPost: (id: string) => nav(`/forum/${id}`),
  };
};

function HeroTwinCards() {
  return (
    <Box
      sx={{
        px: 1,
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        mb: 2,
      }}
    >
      <NextRaceCard />
      <LastRaceTop3 />
    </Box>
  );
}

function CommunityHotTopics() {
  const nav = useNav();
  const posts = useCommunityStore((s) => s.posts);
  const top = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);

  return (
    <NeonCard
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WhatshotRounded sx={{ color: "#DC1F26" }} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Paddock 핫토픽
          </Typography>
        </Box>
      }
    >
      {top.length > 0 ? (
        <Stack spacing={1.2}>
          {top.map((t, i) => (
            <Box
              key={t.id}
              onClick={() => nav.toPost(t.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.2,
                borderRadius: 2,
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))",
                backdropFilter: "blur(6px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                cursor: "pointer",
                transition: "all .25s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Chip
                  label={i + 1}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #001489, #DC1F26)",
                    color: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#111",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "180px",
                  }}
                >
                  {t.title}
                </Typography>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                  fontWeight: 500,
                  gap: 0.5,
                }}
              >
                ❤️ {t.likes}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 3 }}
        >
          아직 게시물이 없습니다.
        </Typography>
      )}

      <Button
        size="small"
        sx={{
          mt: 2.5,
          fontWeight: 700,
          color: "#001489",
          textTransform: "none",
          "&:hover": { color: "#000", transform: "translateX(4px)" },
          transition: "all .2s ease",
        }}
        endIcon={<ArrowForwardIosRounded fontSize="small" />}
        onClick={nav.toCommunity}
      >
        Paddock 더 보기
      </Button>
    </NeonCard>
  );
}

function Highlights() {
  const nav = useNav();
  const photos = useMediaStore((s) => s.photos);
  const setPhotos = useMediaStore((s) => s.setPhotos);

  useEffect(() => {
    const saved = getPhotos();
    if (saved.length > 0) setPhotos(saved);
  }, [setPhotos]);

  const top6 = useMemo(() => photos.slice(0, 6), [photos]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const next: Record<string, string> = {};
      for (const p of top6) {
        if (p.coverUrl?.startsWith("blob:") || p.coverUrl?.startsWith("data:")) {
          next[p.id] = p.coverUrl;
          continue;
        }
        const blobUrl = await loadImage(p.id);
        if (blobUrl) next[p.id] = blobUrl;
      }
      if (alive) setThumbs(next);
    })();
    return () => {
      alive = false;
    };
  }, [top6]);

  return (
    <NeonCard
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 ,paddingBottom:"10px" }}>
          <CameraAltRounded sx={{ color: "#DC1F26" }} /> {/*  빨간색 아이콘 */}
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            F1 Gallery
          </Typography>
        </Box>
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
        }}
      >
        {top6.length > 0 ? (
          top6.map((p) => (
            <Box
              key={p.id}
              component="img"
              src={thumbs[p.id] || p.coverUrl || "/fallback.jpg"}
              alt={p.gp}
              sx={{
                width: "100%",
                height: 96,
                objectFit: "cover",
                borderRadius: 1,
                cursor: "pointer",
                transition: "all .25s ease",
                "&:hover": {
                  opacity: 0.85,
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
              onClick={nav.toGallery}
            />
          ))
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            아직 업로드된 사진이 없습니다.
          </Typography>
        )}
      </Box>

      <Button
        size="small"
        sx={{
          mt: 2,
          fontWeight: 700,
          color: "#001489",
          textTransform: "none",
          "&:hover": { color: "#000", transform: "translateX(4px)" },
          transition: "all .2s ease",
        }}
        endIcon={<ArrowForwardIosRounded fontSize="small" />}
        onClick={nav.toGallery}
      >
        Media 더 보기
      </Button>
    </NeonCard>
  );
}


export default function Home() {
  return (
    <Container sx={{ py: 2 }}>
      <Box sx={{ px: 1, mt: 1, mb: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: -0.2,
            lineHeight: 1.05,
            fontSize: {
              xs: "clamp(24px, 6vw, 36px)",
              md: "clamp(32px, 4vw, 44px)",
            },
          }}
        >
          {SITE_NAME}
        </Typography>
      </Box>

      <HeroTwinCards />
      <SessionRail />
      <Divider sx={{ my: 3, opacity: 0.3 }} />

      <Box
        sx={{
          px: 1,
          mb: 6,
          mt: 3,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <CommunityHotTopics />
        <Highlights />
      </Box>
    </Container>
  );
}

// src/compat/mediaShim.ts
export type SessionType = "Race" | "Qualifying" | "Sprint";

export type PhotoItem = {
  id: string;
  gp: string;
  round: number;
  country: string;
  circuit?: string;
  session: SessionType;
  dateISO: string;
  count: number;
  coverUrl: string;
  tags?: string[];
  createdAt: string;
  views: number;
  likes: number;
  uploaderName?: string;
  uploaderEmail?: string;
  deleteSecretHash?: string;
};

const LS_KEY = "apex-media-photos";

/** SHA-256 → hex (fallback 포함) */
export async function sha256Hex(plain: string): Promise<string> {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const enc = new TextEncoder().encode(plain);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      const arr = Array.from(new Uint8Array(buf));
      return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}
  // ⚠️ 데모용 폴백(보안 목적 X): 환경에 따라 해시 미지원 시라도 업로드가 안 죽게
  let h = 0;
  for (let i = 0; i < plain.length; i++) h = (h * 31 + plain.charCodeAt(i)) | 0;
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

function safeGetLS(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

function safeSetLS(v: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, v);
  } catch {}
}

export function getPhotos(): PhotoItem[] {
  const raw = safeGetLS();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PhotoItem[]) : [];
  } catch {
    return [];
  }
}

export function setPhotos(rows: PhotoItem[]) {
  safeSetLS(JSON.stringify(rows));
}

export type AddPhotoInput = Omit<
  PhotoItem,
  "id" | "createdAt" | "likes" | "views" | "deleteSecretHash"
> & { id?: string;
  deletePasswordPlain?: string };

export function addPhotoSync(
  payload: Omit<PhotoItem, "id" | "createdAt" | "likes" | "views"> & {
    deleteSecretHash?: string;
  }
) {
  const rows = getPhotos();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const item: PhotoItem = {
    id,
    createdAt: new Date().toISOString(),
    likes: 0,
    views: 0,
    ...payload,
  };
  setPhotos([item, ...rows]);
  return item;
}

export async function addPhoto(payload: AddPhotoInput) {
  const hash = payload.deletePasswordPlain
    ? await sha256Hex(payload.deletePasswordPlain)
    : undefined;

  return addPhotoSync({
    ...payload,
    deleteSecretHash: hash,
  });
}

export function bumpView(id: string) {
  const rows = getPhotos();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return;
  rows[idx] = { ...rows[idx], views: (rows[idx].views ?? 0) + 1 };
  setPhotos(rows);
}

export function toggleLike(id: string, delta: 1 | -1) {
  const rows = getPhotos();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return;
  rows[idx] = { ...rows[idx], likes: Math.max(0, (rows[idx].likes ?? 0) + delta) };
  setPhotos(rows);
}

export function deletePhoto(id: string) {
  setPhotos(getPhotos().filter((r) => r.id !== id));
}

/** 관리자/업로더만 true. 게스트는 다이얼로그에서 비번검증 */
export function canDeletePhoto(params: {
  isAdmin?: boolean | (() => boolean);
  currentUser?: { email?: string } | null;
  photo: PhotoItem;
}): boolean {
  const { isAdmin, currentUser, photo } = params;
  const adminOk = typeof isAdmin === "function" ? !!isAdmin() : !!isAdmin;
  if (adminOk) return true;

  if (
    currentUser?.email &&
    photo.uploaderEmail &&
    currentUser.email.toLowerCase() === photo.uploaderEmail.toLowerCase()
  ) {
    return true;
  }
  return false;
}

/** 실제 삭제(게스트: 비밀번호만) */
export async function deletePhotoWithProof(params: {
  isAdmin?: boolean | (() => boolean);
  currentUser?: { email?: string } | null;
  photoId: string;
  passwordPlain?: string;
}) {
  const rows = getPhotos();
  const idx = rows.findIndex((r) => r.id === params.photoId);
  if (idx < 0) throw new Error("not_found");
  const photo = rows[idx];

  const adminOk =
    typeof params.isAdmin === "function" ? !!params.isAdmin() : !!params.isAdmin;
  if (adminOk) return deletePhoto(photo.id);

  if (
    params.currentUser?.email &&
    photo.uploaderEmail &&
    params.currentUser.email.toLowerCase() === photo.uploaderEmail.toLowerCase()
  ) {
    return deletePhoto(photo.id);
  }

  if (!params.passwordPlain) throw new Error("need_credentials");
  if (!photo.deleteSecretHash) throw new Error("no_guest_protection");

  const passOk = (await sha256Hex(params.passwordPlain)) === photo.deleteSecretHash;
  if (!passOk) throw new Error("bad_credentials");

  return deletePhoto(photo.id);
}

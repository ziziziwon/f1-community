import { create } from "zustand";

export type Role = "admin" | "user";

export type User = {
  id: string;
  name: string;
  email?: string; // 항상 소문자/trim 으로 저장
  role: Role;
};

type AuthState = {
  user: User | null;

  /** 권장: 완성된 User를 직접 넣기 (자동 정규화 + 저장됨) */
  setUser: (u: User | null) => void;

  /** 하위호환: 부분 정보로 로그인 (id/role 없어도 OK, 내부에서 보정) */
  login: (p: { id?: string; name?: string; email?: string; role?: Role }) => void;

  logout: () => void;

  // helpers
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
};

/** 🔴 관리자 이메일: 반드시 소문자/trim 으로 관리 */
export const ADMIN_EMAILS = ["jiwon@ApexCharge.com"].map((e) =>
  e.trim().toLowerCase()
);

const LS_USER_KEY = "auth_user";

// 안전한 랜덤 id
const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normEmail = (e?: string) => (e ? e.trim().toLowerCase() : undefined);

const normalizeUser = (u: User | null): User | null => {
  if (!u) return null;
  const email = normEmail(u.email);
  const role: Role =
    u.role === "admin" || u.role === "user"
      ? u.role
      : email && ADMIN_EMAILS.includes(email)
      ? "admin"
      : "user";
  return {
    id: u.id && u.id.length ? u.id : rid(),
    name: u.name || (email ? email.split("@")[0] : "User"),
    email,
    role,
  };
};

const loadUser = (): User | null => {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (!raw) return null;
    return normalizeUser(JSON.parse(raw) as User);
  } catch {
    return null;
  }
};

const saveUser = (u: User | null) => {
  try {
    if (!u) localStorage.removeItem(LS_USER_KEY);
    else localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
  } catch {}
};

export const useAuth = create<AuthState>((set, get) => ({
  // 앱 시작 시 로컬스토리지에서 복구
  user: loadUser(),

  //  완성 User 입력 (정규화 + 저장)
  setUser: (u) => {
    const nu = normalizeUser(u);
    saveUser(nu);
    set({ user: nu });
  },

  //  하위호환: id/role 없어도 호출 가능 (내부에서 보정해서 setUser)
  login: (p) => {
    const email = normEmail(p.email);
    const role: Role =
      p.role ?? (email && ADMIN_EMAILS.includes(email) ? "admin" : "user");
    const u: User = {
      id: p.id && p.id.length ? p.id : rid(),
      name: p.name || (email ? email.split("@")[0] : "User"),
      email,
      role,
    };
    get().setUser(u);
  },

  logout: () => {
    saveUser(null);
    set({ user: null });
  },

  isAuthenticated: () => !!get().user,

  //  role 우선 + 이메일 화이트리스트 보조
  isAdmin: () => {
    const u = get().user;
    if (!u) return false;
    if (u.role === "admin") return true;
    return !!u.email && ADMIN_EMAILS.includes(u.email);
  },
}));

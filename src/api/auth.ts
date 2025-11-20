import type { User, Role } from "../stores/auth";
import { ADMIN_EMAILS } from "../stores/auth";

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  await new Promise((r) => setTimeout(r, 350));
  const e = email.trim().toLowerCase();
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(e) || password.trim().length < 4) {
    throw new Error("이메일 형식 또는 비밀번호(4자 이상)를 확인하세요.");
    }
  const role: Role = ADMIN_EMAILS.includes(e) ? "admin" : "user";
  const user: User = { id: rid(), name: e.split("@")[0], email: e, role };
  const token = "mock." + btoa(`${e}:${Date.now()}`);
  return { token, user };
}

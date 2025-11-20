import { create } from "zustand";

type UserPrefs = {
  favTeamId: string | null;
  notifications: boolean;
  setFavTeam: (id: string | null) => void;
  toggleNoti: () => void;
};

//  로그인한 유저별로 localStorage 키 분리
const getUserKey = (uid?: string) => `f1-prefs-${uid ?? "guest"}`;

export const useUserPrefs = create<UserPrefs>((set, get) => {
  const uid = localStorage.getItem("auth-uid") ?? "guest";
  const key = getUserKey(uid);
  const saved = localStorage.getItem(key);
  let initial = { favTeamId: null, notifications: true };
  if (saved) try { initial = { ...initial, ...JSON.parse(saved) }; } catch {}

  const save = (next: Partial<UserPrefs>) => {
    const uid = localStorage.getItem("auth-uid") ?? "guest";
    localStorage.setItem(getUserKey(uid), JSON.stringify({
      favTeamId: next.favTeamId ?? get().favTeamId,
      notifications: next.notifications ?? get().notifications,
    }));
  };

  return {
    ...initial,
    setFavTeam: (id) => {
      set({ favTeamId: id });
      save({ favTeamId: id });
    },
    toggleNoti: () => {
      const next = !get().notifications;
      set({ notifications: next });
      save({ notifications: next });
    },
  };
});

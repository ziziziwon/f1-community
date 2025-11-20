import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ========= 타입 ========= */
export type SettingsState = {
  favoriteTeam: string;
  themeMode: "light" | "dark";
  fontScale: "normal" | "large";
  notifyComment: boolean;
  notifyReply: boolean;
  notifyLike: boolean;
  notifySound: boolean;

  // setters
  setFavoriteTeam: (team: string) => void;
  setThemeMode: (mode: "light" | "dark") => void;
  setFontScale: (scale: "normal" | "large") => void;
  setNotifyComment: (v: boolean) => void;
  setNotifyReply: (v: boolean) => void;
  setNotifyLike: (v: boolean) => void;
  setNotifySound: (v: boolean) => void;
  resetAll: () => void;
};

/* ========= Zustand Store ========= */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      favoriteTeam: "",
      themeMode: "light",
      fontScale: "normal",
      notifyComment: true,
      notifyReply: true,
      notifyLike: true,
      notifySound: false,

      // setters
      setFavoriteTeam: (team) => set({ favoriteTeam: team }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setFontScale: (scale) => set({ fontScale: scale }),
      setNotifyComment: (v) => set({ notifyComment: v }),
      setNotifyReply: (v) => set({ notifyReply: v }),
      setNotifyLike: (v) => set({ notifyLike: v }),
      setNotifySound: (v) => set({ notifySound: v }),

      resetAll: () =>
        set({
          favoriteTeam: "",
          themeMode: "light",
          fontScale: "normal",
          notifyComment: true,
          notifyReply: true,
          notifyLike: true,
          notifySound: false,
        }),
    }),
    { name: "apex-settings-store" }
  )
);

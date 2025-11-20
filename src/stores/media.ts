import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhotoItem } from "../compat/mediaShim";

type MediaState = {
  photos: PhotoItem[];
  setPhotos: (list: PhotoItem[]) => void;
  addPhoto: (item: PhotoItem) => void;
  clearPhotos: () => void;
};

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      photos: [],
      setPhotos: (list) => set({ photos: list }),
      addPhoto: (item) => set({ photos: [item, ...get().photos] }),
      clearPhotos: () => set({ photos: [] }),
    }),
    {
      name: "media-store",
      partialize: (state) => ({ photos: state.photos.map(({ coverUrl, ...r }) => r) }), // Blob URL 제외 저장
    }
  )
);

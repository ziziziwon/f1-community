// src/stores/community.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Post = {
  id: string;
  title: string;
  content: string;
  comments: number;
  likes: number;
  createdAt: string;
};

type State = {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Omit<Post, "id" | "likes" | "comments" | "createdAt">) => void;
  likePost: (id: string) => void;
};

export const useCommunityStore = create<State>()(
  persist(
    (set) => ({
      posts: [],
      setPosts: (posts) => set({ posts }),

      addPost: (post) =>
        set((s) => ({
          posts: [
            ...s.posts,
            {
              ...post,
              id: crypto.randomUUID(),
              likes: 0,
              comments: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      likePost: (id) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, likes: p.likes + 1 } : p
          ),
        })),
    }),
    {
      name: "community-posts", // localStorage key
    }
  )
);

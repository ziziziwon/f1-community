export type Team = "Red Bull" | "Ferrari" | "Mercedes" | "McLaren";

export interface Race {
  id: string;
  round: number;
  name: string;
  circuit: string;
  startUTC: string; // ISO
}
export interface Result {
  raceId: string;
  pos: number;
  driver: string;
  team: Team;
  points: number;
  fl?: string;
}
export interface Thread {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  category: "strategy" | "driver" | "free";
}
export interface Meme {
  id: string;
  url: string;
  caption?: string;
  author: string;
  createdAt: string;
}

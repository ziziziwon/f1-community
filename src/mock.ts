import type { Race, Result, Thread, Meme } from "./types";

export const races: Race[] = [
  { id: "r-jpn-25", round: 17, name: "Japanese GP", circuit: "Suzuka", startUTC: "2025-10-05T05:00:00Z" },
  { id: "r-qat-25", round: 18, name: "Qatar GP", circuit: "Lusail",  startUTC: "2025-10-19T16:00:00Z" },
];

export const results: Result[] = [
  { raceId: "r-jpn-25", pos: 1, driver: "Max Verstappen", team: "Red Bull", points: 25, fl: "1:31.2" },
  { raceId: "r-jpn-25", pos: 2, driver: "Charles Leclerc", team: "Ferrari", points: 18 },
  { raceId: "r-jpn-25", pos: 3, driver: "Lando Norris", team: "McLaren", points: 15 },
];

export const threads: Thread[] = [
  { id: "t1", title: "스즈카 타이어 전략 토론", author: "pitgirl", createdAt: new Date().toISOString(), category: "strategy" },
  { id: "t2", title: "맥스 스타트 리액션 모음", author: "gridboy", createdAt: new Date().toISOString(), category: "driver" },
];

export const memes: Meme[] = [
  { id: "m1", url: "https://picsum.photos/600/360", caption: "피트스탑 1.8s 미쳤다", author: "memeking", createdAt: new Date().toISOString() },
];

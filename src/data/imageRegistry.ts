
// 앱에서 사용하는 팀 키 (TEAM_DATA의 key와 동일)
export type TeamKey =
  | "redbull" | "ferrari" | "mercedes" | "mclaren" | "aston"
  | "alpine" | "williams" | "rb" | "sauber" | "haas";

// 드라이버 키는 Ergast driverId를 권장 (예: max_verstappen)
export type DriverKey = string;

/* ───────────── Placeholder (없어도 동작하지만 권장) ───────────── */
export const FALLBACK_DRIVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
      <rect width='96' height='96' rx='48' fill='#f3f4f7'/>
      <circle cx='48' cy='38' r='16' fill='#b5bfd6'/>
      <path d='M20,84c4-16,22-22,28-22s24,6,28,22' fill='#b5bfd6'/>
    </svg>`
  );

export const PLACEHOLDERS = {
  team: "/assets/placeholders/team.svg",     // public 기준 경로
  driver: "/assets/placeholders/driver.svg", // 없으면 FALLBACK_DRIVER 사용됨
};

/* ───────────── 팀 로고 (로컬: public/assets/teams/*.svg) ─────────────
   파일만 놓으면 됨. 파일명=팀키 (예: redbull.svg, ferrari.svg ...)
   없으면 placeholder로 떨어짐 */
export function getTeamLogo(teamId?: string): string {
  if (!teamId) return PLACEHOLDERS.team;
  // public 폴더는 절대경로처럼 바로 참조 가능
  return `/assets/teams/${teamId}.svg`;
}

/* ───────────── 드라이버 이미지 (외부 URL 레지스트리) ─────────────
   필요한 것만 점진적으로 추가해도 OK. 없으면 placeholder/fallback */
export const DRIVER_URLS: Record<DriverKey, string> = {
  // 예시 몇 개만 넣어둠 — 필요할 때 추가하자
  max_verstappen:
    "https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/max-verstappen.png",
  sergio_perez:
    "https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/sergio-perez.png",
  lando_norris:
    "https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/lando-norris.png",
  oscar_piastri:
    "https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/oscar-piastri.png",
  charles_leclerc:
    "https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/charles-leclerc.png",
  carlos_sainz:
    "https://media.formula1.com/content/dam/fom-website/manual/Misc/Driver%20Headshots/carlos-sainz.png",
};

/** 드라이버 이미지 후보들을 반환 (로컬 → 외부 → fallback) */
export function getDriverImageCandidates(driverId?: DriverKey): string[] {
  const cands: string[] = [];
  if (driverId) {
    // 로컬(있다면): public/assets/drivers/{driverId}.(png|webp|jpg)
    cands.push(`/assets/drivers/${driverId}.png`);
    cands.push(`/assets/drivers/${driverId}.webp`);
    cands.push(`/assets/drivers/${driverId}.jpg`);

    // 외부 URL (레지스트리에 있으면)
    if (DRIVER_URLS[driverId]) cands.push(DRIVER_URLS[driverId]);
  }
  // 플레이스홀더 / 최종 fallback
  cands.push(PLACEHOLDERS.driver || FALLBACK_DRIVER);
  return cands;
}

export type TeamKey =
  | "redbull" | "ferrari" | "mercedes" | "mclaren" | "aston"
  | "alpine" | "williams" | "rb" | "sauber" | "haas";

type Driver = { name: string; img: string; nation: string; number: number };
type TeamStats = { points: number; wins: number; podiums: number };

export type Team = {
  name: string;
  apiName?: string;   // Ergast/F1 API 비교용 이름
  color: string;
  gradient: string;
  slogan: string;
  logo: string;       
  carImg?: string;   
  stats?: TeamStats;
  drivers: Driver[]; 
};

export const TEAM_DATA: Record<TeamKey, Team> = {
  redbull: {
    name: "Oracle Red Bull Racing",
    apiName: "Red Bull",
    color: "#1E41FF",
    gradient: "linear-gradient(135deg, #1E41FF, #DA291C)",
    slogan: "Pushing beyond limits.",
    logo: "/assets/teams/redbull.png",
    stats: { points: 860, wins: 18, podiums: 23 },
    drivers: [
      { name: "Max Verstappen", img: "/assets/drivers/max_verstappen.avif", nation: "🇳🇱", number: 1 },
      { name: "Yuki Tsunoda",   img: "/assets/drivers/yuki_tsunoda.webp",  nation: "🇯🇵", number: 22 },
    ],
  },
  ferrari: {
    name: "Scuderia Ferrari",
    apiName: "Ferrari",
    color: "#DA291C",
    gradient: "linear-gradient(135deg, #DA291C, #FFD100)",
    slogan: "Passion. Power. Performance.",
    logo: "/assets/teams/ferrari.avif",
    stats: { points: 615, wins: 4, podiums: 15 },
    drivers: [
      { name: "Charles Leclerc", img: "/assets/drivers/charles_leclerc.avif", nation: "🇲🇨", number: 16 },
      { name: "Lewis Hamilton",  img: "/assets/drivers/lewis_hamilton.webp", nation: "🇬🇧", number: 44 },
    ],
  },
  mercedes: {
    name: "Mercedes-AMG Petronas",
    apiName: "Mercedes",
    color: "#00A19C",
    gradient: "linear-gradient(135deg, #00A19C, #222)",
    slogan: "Driven by excellence.",
    logo: "/assets/teams/mercedes.avif",
    stats: { points: 525, wins: 2, podiums: 14 },
    drivers: [
      { name: "George Russell",        img: "/assets/drivers/george_russell.webp",   nation: "🇬🇧", number: 63 },
      { name: "Andrea Kimi Antonelli", img: "/assets/drivers/kimi_antonelli.avif", nation: "🇮🇹", number: 0 },
    ],
  },
  mclaren: {
    name: "McLaren F1 Team",
    apiName: "McLaren",
    color: "#FF8700",
    gradient: "linear-gradient(135deg, #FF8700, #1D1D1D)",
    slogan: "Fearlessly forward.",
    logo: "/assets/teams/mclaren.avif",
    stats: { points: 495, wins: 3, podiums: 11 },
    drivers: [
      { name: "Lando Norris",  img: "/assets/drivers/lando_norris.webp",  nation: "🇬🇧", number: 4 },
      { name: "Oscar Piastri", img: "/assets/drivers/oscar_piastri.avif", nation: "🇦🇺", number: 81 },
    ],
  },
  aston: {
    name: "Aston Martin Aramco",
    apiName: "Aston Martin",
    color: "#006F62",
    gradient: "linear-gradient(135deg, #006F62, #003E34)",
    slogan: "Power. Beauty. Soul.",
    logo: "/assets/teams/aston.avif",
    stats: { points: 286, wins: 0, podiums: 8 },
    drivers: [
      { name: "Fernando Alonso", img: "/assets/drivers/fernando_alonso.avif", nation: "🇪🇸", number: 14 },
      { name: "Lance Stroll",    img: "/assets/drivers/lance_stroll.avif", nation: "🇨🇦", number: 18 },
    ],
  },
  alpine: {
    name: "BWT Alpine F1 Team",
    apiName: "Alpine",
    color: "#0090FF",
    gradient: "linear-gradient(135deg, #0090FF, #FF6BB5)",
    slogan: "Racing. Redefined.",
    logo: "/assets/teams/alpine.avif",
    stats: { points: 185, wins: 0, podiums: 3 },
    drivers: [
      { name: "Pierre Gasly",      img: "/assets/drivers/pierre_gasly.webp",     nation: "🇫🇷", number: 10 },
      { name: "Franco Colapinto",  img: "/assets/drivers/franco_colapinto.avif", nation: "🇦🇷", number: 0 },
      { name: "Jack Doohan",       img: "/assets/drivers/jack_doohan.avif",      nation: "🇦🇺", number: 0 }
    ],
  },
  williams: {
    name: "Williams Racing",
    apiName: "Williams",
    color: "#005AFF",
    gradient: "linear-gradient(135deg, #005AFF, #00D2FF)",
    slogan: "A legacy of speed.",
    logo: "/assets/teams/williams.avif",
    stats: { points: 64, wins: 0, podiums: 1 },
    drivers: [
      { name: "Alexander Albon", img: "/assets/drivers/alexander_albon.avif", nation: "🇹🇭", number: 23 },
      { name: "Carlos Sainz",    img: "/assets/drivers/carlos_sainz.webp", nation: "🇪🇸", number: 55 },
    ],
  },
  rb: {
    name: "Visa Cash App RB F1 Team",
    apiName: "RB",
    color: "#2B006E",
    gradient: "linear-gradient(135deg, #2B006E, #4F00D8)",
    slogan: "Unleash the beast.",
    logo: "/assets/teams/rb.avif",
    stats: { points: 52, wins: 0, podiums: 0 },
    drivers: [
      { name: "Liam Lawson",  img: "/assets/drivers/liam_lawson.webp",  nation: "🇳🇿", number: 30 },
      { name: "Isack Hadjar", img: "/assets/drivers/isack_hadjar.webp",  nation: "🇫🇷", number: 0 },
    ],
  },
  sauber: {
    name: "Stake F1 Team Kick Sauber",
    apiName: "sauber",
    color: "#00FF87",
    gradient: "linear-gradient(135deg, #00FF87, #004D40)",
    slogan: "The next evolution.",
    logo: "/assets/teams/sauber.avif",
    stats: { points: 28, wins: 0, podiums: 0 },
    drivers: [
      { name: "Nico Hülkenberg",   img: "/assets/drivers/nico_hulkenberg.webp", nation: "🇩🇪", number: 27 },
      { name: "Gabriel Bortoleto", img: "/assets/drivers/gabriel_bortoleto.webp",  nation: "🇧🇷", number: 0 },
    ],
  },
  haas: {
    name: "MoneyGram Haas F1 Team",
    apiName: "Haas",
    color: "#B71C1C",
    gradient: "linear-gradient(135deg, #B71C1C, #212121)",
    slogan: "Built for performance.",
    logo: "/assets/teams/haas.avif",
    stats: { points: 22, wins: 0, podiums: 0 },
    drivers: [
      { name: "Esteban Ocon",   img: "/assets/drivers/esteban_ocon.avif",    nation: "🇫🇷", number: 31 },
      { name: "Oliver Bearman", img: "/assets/drivers/oliver_bearman.webp", nation: "🇬🇧", number: 0 },
    ],
  },
};

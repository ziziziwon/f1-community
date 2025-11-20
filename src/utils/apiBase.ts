export function getApiBase(): string {
  // Prefer explicit environment override, otherwise use BASE_URL + 'api'
  const env = import.meta.env.VITE_API_BASE;
  if (env && env.length) return env.replace(/\/+$/, "");
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/+$/, "")}/api`.replace(/\/+/g, "/");
}

export default getApiBase;

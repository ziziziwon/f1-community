export function withAsset(path?: string | null): string | undefined {
  if (!path) return undefined;
  // leave external and data URIs untouched
  if (/^https?:\/\//.test(path) || /^data:/.test(path)) return path;
  // remove leading slashes then prepend BASE_URL
  const trimmed = path.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${trimmed}`;
}

export default withAsset;

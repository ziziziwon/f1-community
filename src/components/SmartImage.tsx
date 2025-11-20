import * as React from "react";

type Props = {
  srcCandidates: string[];
  alt?: string;
  width?: number | string;
  height?: number | string;
  radius?: number | string; // 50%면 원형
  style?: React.CSSProperties;
  objectFit?: React.CSSProperties["objectFit"];
};

export default function SmartImage({
  srcCandidates,
  alt = "",
  width,
  height,
  radius = "50%",
  objectFit = "cover",
  style,
}: Props) {
  const [idx, setIdx] = React.useState(0);
  const src = srcCandidates[idx] ?? "";

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => (i < srcCandidates.length - 1 ? i + 1 : i))}
      style={{ borderRadius: radius, objectFit, display: "block", ...style }}
    />
  );
}

import { SvgIcon, type SvgIconProps } from "@mui/material";

/** 체크 무늬 레이싱 깃발 */
export default function CheckeredFlag(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Flag pole */}
      <path d="M4 3h2v18H4z" />
      {/* Flag body (waving) */}
      <path d="M6 4c3 0 3 2 6 2s3-2 6-2v8c-3 0-3 2-6 2s-3-2-6-2V4z" />
      {/* Check pattern (lighter squares) */}
      <path
        d="M6 4h3v2H6zM12 4h3v2h-3zM9 6h3v2H9zM15 6h3v2h-3zM6 8h3v2H6zM12 8h3v2h-3z"
        opacity=".35"
      />
    </SvgIcon>
  );
}


import { SvgIcon, type SvgIconProps } from "@mui/material";

/** 포디움(순위) */
export default function Podium(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M3 18h5v-5H3v5zM10 18h5V6h-5v12zM17 18h4v-8h-4v8z" />
    </SvgIcon>
  );
}
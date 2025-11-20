import * as React from "react";
import { Chip } from "@mui/material";

export default function EnergyChip({ label }: { label: React.ReactNode }) {
  return <Chip label={label} size="small" sx={{ bgcolor: "warning.main", color: "black", fontWeight: 800 }} />;
}

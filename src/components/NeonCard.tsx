import * as React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function NeonCard({
  title,
  children,
}: {
  /** string | JSX 모두 가능하게 수정 */
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "0 1px 2px rgba(17,24,39,.06)",
        transition: "box-shadow .2s ease, transform .2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: `0 10px 28px ${alpha("#001489", 0.12)}`,
        },
      }}
    >
      <CardContent>
        {/* string일 경우 Typography로, JSX면 그대로 */}
        {title &&
          (typeof title === "string" ? (
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              {title}
            </Typography>
          ) : (
            title
          ))}

        {children}
      </CardContent>
    </Card>
  );
}

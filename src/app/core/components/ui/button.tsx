//button.tsx
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import React from "react";
import theme from "./theme";

interface ButtonProps extends MuiButtonProps {
  variant?: "contained" | "outlined" | "text";
}

export function Button({
  children,
  variant = "contained",
  ...rest
}: ButtonProps) {
  return (
    <MuiButton
      variant={variant}
      color="primary"
      {...rest}
      sx={{
        textTransform: "none",
        "&.MuiButton-contained": {
          backgroundColor: theme.palette.primary.main,
        },
        "&.MuiButton-outlined": {
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
          },
        },
        "&.MuiButton-text": {
          color: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
          },
        },
      }}
    >
      {children}
    </MuiButton>
  );
}

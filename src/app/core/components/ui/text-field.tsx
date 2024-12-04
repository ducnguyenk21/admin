//text-field.tsx
import React from "react";
import {
  TextField as MuiTextField,
  InputAdornment,
  TextFieldProps as MuiTextFieldProps,
} from "@mui/material";
import { SxProps } from "@mui/system";
import theme from "./theme";

interface TextFieldProps extends Omit<MuiTextFieldProps, "InputProps"> {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  maxLength?: number;
  endAdornment?: React.ReactNode; // Prop for adornments
  error?: boolean; // Add error prop
  helperText?: string; // Optional helper text prop for displaying error messages
  sx?: SxProps; // Use SxProps type for the sx prop
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
  endAdornment,
  error = false,
  helperText,
  sx,
  ...muiProps
}) => {
  return (
    <MuiTextField
      fullWidth
      margin="normal"
      label={label}
      variant="outlined"
      value={value}
      onChange={onChange}
      type={type}
      inputProps={{ maxLength }}
      InputProps={{
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : null,
      }}
      error={error}
      helperText={error ? helperText : undefined}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 50,
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
          },
        },
        "& label.Mui-focused": {
          color: theme.palette.primary.main,
        },
        ...sx,
      }}
      {...muiProps}
    />
  );
};

export default TextField;

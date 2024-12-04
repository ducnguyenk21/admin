// LoginForm.tsx
import React from "react";
import ResetPassword from "./ForgotPasswordDialog";
import { Button } from "@/app/core/components/ui/button";
import theme from "@/app/core/components/ui/theme";
import TextField from "@/app/core/components/ui/text-field";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import useLoginHandlers from "@/app/core/hooks/useLoginHandlers";
import {
  Alert,
  Avatar,
  Box,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Typography,
} from "@mui/material";

export default function LoginForm() {
  const {
    username,
    password,
    rememberMe,
    alert,
    setAlert,
    showPassword,
    handleUsernameChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleLogin,
    setShowPassword,
    isLoggedIn,
  } = useLoginHandlers();

  const [showResetPassword, setShowResetPassword] = React.useState(false);

  const handleForgotPassword = () => {
    setShowResetPassword(true);
  };

  const handleCloseResetPassword = () => {
    setShowResetPassword(false);
  };

  return (
    <div>
      {/* Logo */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Avatar
          src="/logo_image.png"
          sx={{ width: "80px", height: "82px" }}
          alt="Logo Gov"
        />
      </Box>

      {/* Form Title */}
      <Typography
        variant="h5"
        textAlign="center"
        mb={2}
        fontWeight="bold"
        color="text.primary"
      >
        Fitness Workout Management
      </Typography>

      {/* Login Form */}
      <form className="space-y-3" onSubmit={handleLogin}>
        {/* Tên Tài Khoản (Username) Input */}
        <TextField
          label="Tên tài khoản"
          value={username}
          onChange={handleUsernameChange}
          maxLength={50}
        />

        {/* Mật Khẩu (Password) Input */}
        <TextField
          label="Mật khẩu"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handlePasswordChange}
          maxLength={50}
          inputProps={{
            endAdornment: (
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            ),
          }}
        />

        {/* Nhớ Mật Khẩu Checkbox và Quên Mật Khẩu Link */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                sx={{
                  color: theme.palette.primary.main,
                  "&.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label="Nhớ mật khẩu"
            sx={{ color: "black" }}
          />

          <Typography
            onClick={handleForgotPassword}
            variant="body2"
            sx={{
              cursor: "pointer",
              color: theme.palette.primary.main,
              fontWeight: "bold",
            }}
          >
            Quên mật khẩu
          </Typography>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Đăng nhập
        </Button>
      </form>

      {showResetPassword && (
        <ResetPassword onClose={handleCloseResetPassword} />
      )}

      {/* Snackbar for Alerts */}
      <Snackbar
        open={alert.visible}
        autoHideDuration={2000}
        onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

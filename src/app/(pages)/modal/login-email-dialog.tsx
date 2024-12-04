//EmailDialog.tsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Button } from "@/app/core/components/ui/button"; // Sử dụng Button đã tạo sẵn
import TextField from "@/app/core/components/ui/text-field"; // Sử dụng TextField đã có sẵn

interface ResetPasswordEmailProps {
  open: boolean;
  onClose: () => void;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  emailError: string;
  handleEmailSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  successMessage: string;
  countdown: number;
  setCountdown: React.Dispatch<React.SetStateAction<number>>; // Add this line
  isTimerActive: boolean;
  setIsTimerActive: React.Dispatch<React.SetStateAction<boolean>>; // Add this line
}

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({
  open,
  onClose,
  email,
  setEmail,
  emailError,
  handleEmailSubmit,
  successMessage,
  countdown,
  setCountdown,
  isTimerActive,
  setIsTimerActive,
}) => {
  // Hàm handleEmailChange cập nhật giá trị email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}
      >
        Quên mật khẩu
      </DialogTitle>
      <DialogContent
        sx={{ textAlign: "center", width: "100%", height: "auto" }}
      >
        <Typography>Vui lòng nhập email đã đăng ký tài khoản</Typography>
        <TextField
          variant="outlined"
          label="Email (*)"
          placeholder="Nhập email"
          value={email}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError}
          sx={{ width: 500, height: "auto", marginBottom: "-10px" }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          onClick={handleEmailSubmit}
          variant="contained"
          disabled={isTimerActive} // Disable the button based on the timer
          style={{
            opacity: isTimerActive ? 0.5 : 1, // Optional: Change opacity when disabled
            cursor: isTimerActive ? "not-allowed" : "pointer",
            width: "85%",
            height: 42,
            marginBottom: 10, // Adjust button size
          }}
        >
          Gửi yêu cầu
        </Button>
        {successMessage && <Typography>{successMessage}</Typography>}
        {isTimerActive && (
          <Typography
            color="green"
            marginTop={"10px"}
            alignItems="center"
            display="flex"
          >
            Bạn có thể gửi yêu cầu lại sau {countdown} giây.
          </Typography>
        )}
        <Box display="flex" alignItems="center">
          <Typography>Bạn đã có tài khoản? </Typography>
          {/* Thay thế Button bằng Typography với sự kiện onClick */}
          <Button
            onClick={onClose}
            variant="text" // Thay đổi variant thành "text"
            sx={{ textTransform: "none" }} // Để giữ nguyên chữ hoa nếu có
          >
            Đăng nhập
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordEmail;

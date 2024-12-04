import React, { useState, useEffect } from "react";
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Button } from "@/app/core/components/ui/button";
import EmailDialog from "@/app/(pages)/modal/login-email-dialog";
import {
  getAuth,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

interface ResetPasswordProps {
  onClose: () => void;
}

interface AlertState {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  visible: boolean;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onClose }) => {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    severity: "error",
    visible: false,
  });

  const handleClose = () => {
    setShowEmailPopup(false);
    onClose();
  };

  const showAlert = (
    message: string,
    severity: "success" | "error" | "warning" | "info",
    visible: boolean
  ) => {
    setAlert({
      message,
      severity,
      visible,
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isTimerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
      setCountdown(0);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTimerActive, countdown]);

  const handleEmailSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      showAlert("Vui lòng nhập đúng định dạng email.", "error", true);
      setEmailError("Vui lòng nhập đúng định dạng email.");
      return;
    }

    const auth = getAuth();

    try {
      // Kiểm tra xem email có tồn tại trong Firebase không
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        showAlert("Email không tồn tại trong hệ thống.", "error", true);
        setEmailError("Email không tồn tại trong hệ thống.");
        return;
      }

      // Nếu email tồn tại, gửi email đặt lại mật khẩu
      await sendPasswordResetEmail(auth, email);
      showAlert("Email đã được gửi thành công!", "success", true);
      setSuccessMessage("Email đã được gửi thành công!");
      setIsTimerActive(true);
      setCountdown(5);
    } catch (error) {
      console.error("Error sending email:", error);
      showAlert("Có lỗi xảy ra khi gửi email.", "error", true);
      setEmailError("Có lỗi xảy ra khi gửi email.");
    }
  };

  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  return (
    <>
      <Dialog
        open={!showEmailPopup}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ textAlign: "center", fontWeight: "bold", fontSize: "24px" }}
        >
          Vui lòng chọn phương thức
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", mb: "-20px" }}>
          {/* <Button
            fullWidth
            variant="contained"
            style={{
              width: "85%",
              height: 42,
              marginBottom: 20,
              fontWeight: "bold",
            }}
          >
            Gửi mã xác thực qua SMS
          </Button> */}
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            style={{
              width: "85%",
              height: 42,
              fontWeight: "bold",
            }}
            onClick={() => setShowEmailPopup(true)}
          >
            Gửi mã xác thực qua Email
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Typography>Bạn đã có tài khoản?</Typography>
          <Button
            onClick={handleClose}
            variant="text"
            sx={{ textTransform: "none" }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      {showEmailPopup && (
        <EmailDialog
          open={showEmailPopup}
          onClose={() => setShowEmailPopup(false)}
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          handleEmailSubmit={handleEmailSubmit}
          successMessage={successMessage}
          countdown={countdown}
          isTimerActive={isTimerActive}
          setCountdown={setCountdown}
          setIsTimerActive={setIsTimerActive}
        />
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
    </>
  );
};

export default ResetPassword;

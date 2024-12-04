// useLoginHandlers.ts
import { useEffect, useState } from "react";
import { auth } from "@/services/firebase"; // Đảm bảo bạn đã cấu hình Firebase
import { signInWithEmailAndPassword } from "firebase/auth"; // Nhập khẩu từ Firebase
import { Snackbar, Alert } from "@mui/material";
import { FirebaseError } from "firebase/app"; // Nhập khẩu FirebaseError
import { getDoc, doc } from "firebase/firestore"; // Nhập các hàm cần thiết từ Firestore
import { db } from "@/services/firebase"; // Đảm bảo bạn đã cấu hình Firebase

interface AlertState {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  visible: boolean;
}

const useLoginHandlers = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // Sẽ được sử dụng để nhập email
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    severity: "error",
    visible: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  // Tải thông tin đã lưu khi lần đầu tiên tải trang
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedRememberMe) {
      setUsername(savedUsername || "");
      setPassword(savedPassword || "");
      setRememberMe(savedRememberMe);
    }
  }, []);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 50) {
      setUsername(value);
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 50) {
      setPassword(value);
    }
  };

  const handleRememberMeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRememberMe(event.target.checked);
  };

  const showAlert = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setAlert({ message, severity, visible: true });
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const validatePassword = (password: string): true | string => {
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
    if (/\s/.test(password)) return "Mật khẩu không được chứa khoảng trắng.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";
    if (!/[A-Z]/.test(password))
      return "Mật khẩu phải có ít nhất 1 ký tự in hoa.";
    if (!/[a-z]/.test(password))
      return "Mật khẩu phải có ít nhất 1 ký tự thường.";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải có ít nhất 1 ký tự số.";
    return true;
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      showAlert("Vui lòng nhập đầy đủ thông tin", "error");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation !== true) {
      showAlert(passwordValidation, "error");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("password");
      localStorage.removeItem("rememberMe");
    }

    try {
      // Sử dụng Firebase để đăng nhập
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );

      // Lấy thông tin người dùng từ Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Kiểm tra trạng thái activate và role
        if (userData.activate && userData.role === "admin") {
          const token = await userCredential.user.getIdToken(); // Lấy token sau khi đăng nhập
          localStorage.setItem("access_token", token); // Lưu token vào localStorage

          // Lưu các thông tin người dùng vào localStorage
          localStorage.setItem("user_uid", userCredential.user.uid);
          localStorage.setItem("user_email", username); // Sử dụng username làm email
          localStorage.setItem("user_dob", userData.date_of_birth || ""); // Lưu ngày sinh
          localStorage.setItem("user_fname", userData.fname || ""); // Lưu fname
          localStorage.setItem("user_lname", userData.lname || ""); // Lưu lname
          localStorage.setItem("user_gender", userData.gender || ""); // Lưu giới tính
          localStorage.setItem("user_height", userData.height || ""); // Lưu chiều cao
          localStorage.setItem("user_level", userData.level || ""); // Lưu cấp độ
          localStorage.setItem("user_weight", userData.weight || ""); // Lưu cân nặng
          localStorage.setItem("user_role", userData.role || ""); // Lưu vai trò
          localStorage.setItem("user_pic", userData.pic || ""); // Lưu hình ảnh
          localStorage.setItem("user_activate", userData.activate.toString()); // Lưu trạng thái kích hoạt
          showAlert("Đăng nhập thành công!", "success");
          setIsLoggedIn(true); // Cập nhật trạng thái đăng nhập
          window.location.reload(); // Tải lại trang nếu cần
        } else {
          // Nếu không hoạt động hoặc không phải admin
          await auth.signOut();
          showAlert(
            "Tài khoản của bạn không có quyền truy cập. Vui lòng liên hệ với quản trị viên.",
            "error"
          );
        }
      } else {
        console.error("Không tìm thấy tài liệu người dùng.");
        showAlert("Tài khoản không tồn tại", "error");
      }
    } catch (error) {
      const firebaseError = error as FirebaseError; // Chỉ định kiểu cho error
      console.error("Login error:", firebaseError);

      // Kiểm tra mã lỗi và hiển thị thông báo phù hợp
      switch (firebaseError.code) {
        case "auth/wrong-password":
        case "auth/user-not-found":
          showAlert("Tên tài khoản hoặc mật khẩu không đúng", "error");
          break;
        case "auth/invalid-email":
          showAlert("Địa chỉ email không hợp lệ", "error");
          break;
        case "auth/invalid-credential":
          showAlert("Tên tài khoản hoặc mật khẩu không hợp lệ", "error");
          break;
        default:
          showAlert(
            firebaseError.message || "Đăng nhập không thành công",
            "error"
          );
          break;
      }
    }
  };

  return {
    username,
    password,
    rememberMe,
    alert,
    showPassword,
    handleUsernameChange,
    handlePasswordChange,
    handleRememberMeChange,
    showAlert,
    setAlert,
    handleLogin,
    setShowPassword,
    isLoggedIn,
  };
};

export default useLoginHandlers;

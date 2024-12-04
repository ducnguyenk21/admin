import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Snackbar,
  Alert,
  Switch,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";

interface User {
  uid: string;
  email: string;
  fname: string;
  lname: string;
  gender: string;
  height: string;
  weight: string;
  level: string;
  date_of_birth: string;
  role: string;
  pic: string | null;
  activate: boolean;
}

interface AddPopupProps {
  open: boolean;
  onClose: () => void;
  type: "add" | "edit";
  onUserAdded: () => void;
  uid?: string;
  activate?: boolean;
  email?: string;
  fname?: string;
  lname?: string;
  gender?: string;
  height?: string;
  date_of_birth?: string;
  level?: string;
  weight?: string;
  role?: string;
  pic?: string;
}

interface AlertState {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  visible: boolean;
}

const AddNewPopup: React.FC<AddPopupProps> = ({
  open,
  onClose,
  type,
  onUserAdded,
  uid,
  activate: initialActivate,
  email: initialEmail,
  fname: initialFname,
  lname: initialLname,
  gender: initialGender,
  date_of_birth: initialDateofbirth,
  height: initialHeight,
  level: initialLevel,
  weight: initialWeight,
  role: initialRole,
  pic: initialPic,
}) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fname, setFirstName] = useState(initialFname || "");
  const [password, setPassword] = useState("");
  const [lname, setLastName] = useState(initialLname || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [height, setHeight] = useState(initialHeight || "");
  const [weight, setWeight] = useState(initialWeight || "");
  const [level, setLevel] = useState(initialLevel || "");
  const [role, setRole] = useState<string | null>(initialRole || null);
  const [date_of_birth, setDate_of_birth] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(initialGender || null);
  const [activate, setActivate] = useState(initialActivate || false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    severity: "error",
    visible: false,
  });

  const showAlert = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setAlert({ message, severity, visible: true });
  };

  const fetchUserData = async (userId: string) => {
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      return userSnapshot.data() as User;
    } else {
      throw new Error("User does not exist");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (open && type === "edit" && uid) {
        try {
          const userData = await fetchUserData(uid);
          setActivate(userData.activate || false);
          setEmail(userData.email || "");
          setFirstName(userData.fname || "");
          setLastName(userData.lname || "");
          setGender(userData.gender || "");
          setHeight(userData.height || "");
          setDate_of_birth(userData.date_of_birth || "");
          setLevel(userData.level || "");
          setWeight(userData.weight || "");
          setRole(userData.role || "");
          setAvatar(userData.pic || null);
        } catch (error) {
          showAlert("Error fetching user data: ", "error");
        }
      } else {
        resetData();
      }
    };

    loadData();
  }, [open, type, uid]);

  const resetData = () => {
    setAvatar(null);
    setPassword("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setHeight("");
    setDate_of_birth("");
    setLevel("");
    setRole(null);
    setActivate(false);
    setGender(null);
  };

  const handleClose = () => {
    resetData();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateInputs = () => {
    const heightValue = parseFloat(height);
    const weightValue = parseFloat(weight);
    const dobDate = new Date(date_of_birth || "");
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    const isOlderThanTen = age > 10 || (age === 10 && monthDifference >= 0);

    if (
      !email ||
      (type === "add" && !password) ||
      !fname ||
      !lname ||
      !gender ||
      !level
    ) {
      showAlert("Cần phải nhập tất cả thông tin bắt buộc!", "error");
      return false;
    }

    if (isNaN(heightValue) || heightValue <= 0) {
      showAlert("Chiều cao phải là số dương!", "error");
      return false;
    }

    if (isNaN(weightValue) || weightValue <= 0) {
      showAlert("Cân nặng phải là số dương!", "error");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showAlert("Định dạng email không hợp lệ!", "error");
      return false;
    }

    // Kiểm tra mật khẩu
    if (type === "add" && password.length < 8) {
      showAlert("Mật khẩu phải có ít nhất 8 ký tự.", "error");
      return false;
    }
    if (type === "add" && /\s/.test(password)) {
      showAlert("Mật khẩu không được chứa khoảng trắng.", "error");
      return false;
    }
    if (type === "add" && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      showAlert("Mật khẩu phải có ít nhất 1 ký tự đặc biệt.", "error");
      return false;
    }
    if (type === "add" && !/[A-Z]/.test(password)) {
      showAlert("Mật khẩu phải có ít nhất 1 ký tự in hoa.", "error");
      return false;
    }
    if (type === "add" && !/[a-z]/.test(password)) {
      showAlert("Mật khẩu phải có ít nhất 1 ký tự thường.", "error");
      return false;
    }
    if (type === "add" && !/[0-9]/.test(password)) {
      showAlert("Mật khẩu phải có ít nhất 1 ký tự số.", "error");
      return false;
    }

    if (!isOlderThanTen) {
      showAlert("Ngày sinh phải lớn hơn 10 tuổi!", "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const auth = getAuth();
    const storage = getStorage();
    let userId = uid;

    try {
      if (type === "add") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        userId = userCredential.user.uid;

        let picURL: string | null = null;

        if (avatar) {
          const storageRef = ref(storage, `profile_images/${userId}.jpg`);
          await uploadString(storageRef, avatar, "data_url");
          picURL = await getDownloadURL(storageRef);
        }

        const userData = {
          uid: userId,
          activate,
          email,
          password,
          fname,
          lname,
          gender,
          height,
          level,
          weight,
          date_of_birth,
          role,
          pic: picURL,
        };

        await setDoc(doc(db, "users", userId), userData);
        showAlert("Tạo người dùng thành công", "success");
      } else {
        if (!userId)
          throw new Error("User ID is undefined while trying to edit");

        const userData = {
          activate,
          email,
          password,
          fname,
          lname,
          gender,
          height,
          date_of_birth,
          level,
          weight,
          role,
          pic: avatar,
        };

        await updateDoc(doc(db, "users", userId), userData);
        showAlert("Cập nhật người dùng thành công", "success");
      }
      onUserAdded();

      setTimeout(handleClose, 2000);
    } catch (error) {
      showAlert("Error saving data: ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        style: {
          width: "1100px",
          position: "absolute",
          zIndex: 1300,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {type === "add" ? "Thêm mới" : "Chỉnh sửa"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 16, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" padding={2}>
            <CircularProgress />
          </Box>
        )}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          gap="10px"
        >
          {/* Avatar and Activation Switch */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            width="35%"
            height="360px"
            border="1px solid #E5E5E5"
            borderRadius="10px"
            padding="16px"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border="1px dashed #F4F6F8"
              borderRadius="100%"
              width={200}
              height={200}
              position="relative"
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                border="2px dashed #F4F6F8"
                width={170}
                height={170}
                borderRadius="100%"
              >
                {avatar ? (
                  <>
                    <img
                      src={avatar}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                      }}
                    />
                    <label
                      htmlFor="edit-avatar"
                      style={{
                        position: "absolute",
                        top: "120px",
                        right: "10px",
                        border: "1px solid white",
                        borderRadius: "100%",
                        background: "#F4F6F8",
                      }}
                    >
                      <IconButton component="span">
                        <PhotoCameraIcon sx={{ color: "#A7B1BC" }} />
                      </IconButton>
                    </label>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="edit-avatar"
                      type="file"
                      onChange={handleFileChange}
                    />
                  </>
                ) : (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="upload-avatar"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="upload-avatar">
                      <IconButton component="span">
                        <AddAPhotoIcon sx={{ fontSize: 25 }} />
                      </IconButton>
                    </label>
                    <Typography
                      align="center"
                      sx={{ fontSize: "14px", color: "#72808d" }}
                    >
                      Tải hình đại diện
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            <Typography
              align="center"
              sx={{ marginTop: "20px", fontSize: "14px", color: "#72808d" }}
            >
              *.jpeg, *.jpg, *.png. <br />
              Tối đa 100 KB
            </Typography>
            <Box
              sx={{
                marginTop: "20px",
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  color: "black",
                  marginRight: "8px",
                  marginLeft: "100px",
                }}
              >
                Active
              </Typography>
              <Switch
                sx={{ marginLeft: "30px" }}
                checked={activate}
                onChange={(e) => setActivate(e.target.checked)}
              />
            </Box>
          </Box>

          {/* Form Inputs */}
          <Box
            display="flex"
            flexDirection="column"
            width="65%"
            border="1px solid #eaeaea"
            borderRadius="10px"
            padding="8px"
          >
            {type !== "edit" && (
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                gap="50px"
                padding="8px"
              >
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="dense"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="outlined"
                  size="small"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleClickShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            )}
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap="50px"
              padding="8px"
            >
              <TextField
                margin="dense"
                label="Họ"
                fullWidth
                variant="outlined"
                size="small"
                required
                value={lname}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Tên"
                fullWidth
                variant="outlined"
                size="small"
                required
                value={fname}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap="50px"
              padding="8px"
            >
              <TextField
                select
                margin="dense"
                label="Giới tính"
                fullWidth
                required
                variant="outlined"
                size="small"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Male">Nam</MenuItem>
                <MenuItem value="Female">Nữ</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                label="Ngày sinh"
                type="date"
                fullWidth
                required
                variant="outlined"
                size="small"
                value={date_of_birth}
                onChange={(e) => setDate_of_birth(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap="50px"
              padding="8px"
            >
              <TextField
                margin="dense"
                label="Chiều cao"
                fullWidth
                required
                variant="outlined"
                size="small"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Cân nặng"
                required
                fullWidth
                variant="outlined"
                size="small"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap="50px"
              padding="8px"
            >
              <TextField
                select
                margin="dense"
                label="Level"
                fullWidth
                required
                variant="outlined"
                size="small"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Weight Loss">Weight Loss</MenuItem>
                <MenuItem value="Increase Fitness">Increase Fitness</MenuItem>
                <MenuItem value="Improve Shape">Fat Loss & Toning</MenuItem>
              </TextField>
              <TextField
                select
                margin="dense"
                label="Vai trò"
                fullWidth
                required
                variant="outlined"
                size="small"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="user">Người dùng</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </TextField>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" padding="10px">
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={loading}
            sx={{ width: "100px" }}
          >
            Lưu
          </Button>
        </Box>
      </DialogContent>
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
    </Dialog>
  );
};

export default AddNewPopup;

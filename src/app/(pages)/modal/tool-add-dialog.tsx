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
  CircularProgress,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { doc, setDoc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

interface AddPopupProps {
  open: boolean;
  onClose: () => void;
  type: "add" | "edit";
  onExerciseAdded: () => void;
  refresh?: boolean;
  id?: string; // Document ID for editing
  name?: string; // Existing name for editing
  pic?: string; // Existing picture for editing
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
  onExerciseAdded,
  id,
  name: initialName,
  pic: initialPic,
}) => {
  const [avatar, setAvatar] = useState<string | null>(initialPic || null);
  const [name, setName] = useState(initialName || "");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    severity: "error",
    visible: false,
  });

  const showAlert = (message: string, severity: "success" | "error") => {
    setAlert({ message, severity, visible: true });
  };

  useEffect(() => {
    if (open) {
      if (type === "edit" && id) {
        const fetchData = async () => {
          const docRef = doc(db, "Tools", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name);
            setAvatar(data.pic);
          } else {
            showAlert("No data found for this tool", "error");
          }
        };
        fetchData();
      } else {
        setAvatar(null);
        setName("");
      }
    }
  }, [open, type, id]);

  const handleClose = () => {
    setAvatar(null);
    setName("");
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

  const validateInputs = () => {
    if (!name) {
      showAlert("Vui lòng nhập tên dụng cụ tập luyện!", "error");
      return false;
    }
    if (!avatar) {
      showAlert("Vui lòng tải lên hình ảnh dụng cụ tập luyện!", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const storage = getStorage();

    try {
      let picURL: string | null = null;

      if (avatar && avatar.startsWith("data:")) {
        const storageRef = ref(storage, `workout_image/${name}.jpg`);
        await uploadString(storageRef, avatar, "data_url");
        picURL = await getDownloadURL(storageRef);
      } else {
        picURL = avatar; // Retain the old image if no new image
      }

      const exerciseData = {
        name,
        pic: picURL,
      };

      const exerciseDocRef = doc(db, "Tools", id || name);
      if (type === "add") {
        await setDoc(exerciseDocRef, exerciseData);
        showAlert("Thêm dụng cụ tập luyện thành công", "success");
      } else {
        const oldName = initialName;
        if (name !== oldName) {
          const newDocRef = doc(db, "Tools", name);
          await setDoc(newDocRef, exerciseData);
          await deleteDoc(exerciseDocRef);
          showAlert("Cập nhật dụng cụ tập luyện thành công", "success");
        } else {
          await updateDoc(exerciseDocRef, exerciseData);
          showAlert("Cập nhật dụng cụ tập luyện thành công", "success");
        }
      }
      onExerciseAdded();
      setTimeout(handleClose, 2000);
    } catch (error) {
      console.error("Error saving data:", error);
      showAlert("Có lỗi xảy ra khi lưu dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {type === "add"
          ? "Thêm mới dụng cụ tập luyện"
          : "Chỉnh sửa dụng cụ tập luyện"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 16, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ overflowY: "auto" }}>
        {loading && (
          <Box display="flex" justifyContent="center" padding={2}>
            <CircularProgress />
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={2} padding={2}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            border="1px solid #E5E5E5"
            borderRadius="10px"
            padding="16px"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border="2px dashed #F4F6F8"
              borderRadius="100%"
              width={200}
              height={200}
              position="relative"
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
                    Tải hình dụng cụ tập luyện
                  </Typography>
                </>
              )}
            </Box>
            <Typography
              align="center"
              sx={{ marginTop: "20px", fontSize: "14px", color: "#72808d" }}
            >
              *.jpeg, *.jpg, *.png. <br />
              Tối đa 100 KB
            </Typography>
          </Box>

          <TextField
            margin="dense"
            label="Tên dụng cụ tập luyện"
            fullWidth
            required
            variant="outlined"
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Box display="flex" justifyContent="flex-end" padding={2}>
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewPopup;

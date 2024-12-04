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
  MenuItem,
  Chip,
  CircularProgress,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { DifficultySection } from "@/app/(pages)/exercises/components/DifficultySection";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  uploadBytesResumable,
  uploadBytes,
} from "firebase/storage";

interface AddPopupProps {
  open: boolean;
  onClose: () => void;
  type: "add" | "edit";
  onExerciseAdded: () => void;
  refresh?: boolean; // Thêm dòng này để chấp nhận prop refresh
  id?: string;
  name?: string;
  descriptions?: string;
  pic?: string;
  video?: string;
  difficulty?: {
    Beginner: { calo: number; rep: number; time: number };
    Normal: { calo: number; rep: number; time: number };
    Professional: { calo: number; rep: number; time: number };
  };
  steps?: {
    [key: string]: { detail: string; title: string };
  };
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
  descriptions: initialDescriptions,
  pic: initialPic,
  video: initialVideo,
  difficulty: initialDifficulty,
  steps: initialSteps,
}) => {
  const [avatar, setAvatar] = useState<string | null>(initialPic || null);
  const [name, setName] = useState(initialName || "");
  const [descriptions, setDescriptions] = useState(initialDescriptions || "");
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null); // State để lưu video file
  const [isVideoDeleted, setIsVideoDeleted] = useState(false);
  const [difficulty, setDifficulty] = useState<{
    Beginner: { calo: number; rep: number; time: number };
    Normal: { calo: number; rep: number; time: number };
    Professional: { calo: number; rep: number; time: number };
  }>({
    Beginner: { calo: 0, rep: 0, time: 0 },
    Normal: { calo: 0, rep: 0, time: 0 },
    Professional: { calo: 0, rep: 0, time: 0 },
  });
  const [stepCount, setStepCount] = useState<number>(0);
  const [steps, setSteps] = useState<
    Record<string, { detail: string; title: string }>
  >({});
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

  const fetchExerciseData = async (exerciseId: string) => {
    const exerciseDoc = doc(db, "Exercises", exerciseId);
    const exerciseSnapshot = await getDoc(exerciseDoc);

    if (exerciseSnapshot.exists()) {
      return exerciseSnapshot.data();
    } else {
      throw new Error("Exercise does not exist");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (open && type === "edit" && id) {
        try {
          const exerciseData = await fetchExerciseData(id);
          setAvatar(exerciseData.pic || null);
          setName(exerciseData.name || "");
          setDescriptions(exerciseData.descriptions || "");
          setVideoURL(exerciseData.video || "");
          setDifficulty(exerciseData.difficulty || initialDifficulty);
          setSteps(exerciseData.steps || {});

          // Đếm số bước từ dữ liệu bài tập và cập nhật vào `stepCount`
          const totalSteps = Object.keys(exerciseData.steps || {}).length;
          setStepCount(totalSteps);
        } catch (error) {
          showAlert("Error fetching exercise data: ", "error");
        }
      } else {
        if (type === "add") {
          setDifficulty({
            Beginner: { calo: 0, rep: 0, time: 0 },
            Normal: { calo: 0, rep: 0, time: 0 },
            Professional: { calo: 0, rep: 0, time: 0 },
          });
        } else {
          resetData();
        }
      }
    };

    loadData();
  }, [open, type, id]);

  const resetData = () => {
    setAvatar(null);
    setName("");
    setDescriptions("");
    setVideoURL("");
    setDifficulty({
      Beginner: { calo: 0, rep: 0, time: 0 },
      Normal: { calo: 0, rep: 0, time: 0 },
      Professional: { calo: 0, rep: 0, time: 0 },
    });
    setSteps({});
    setStepCount(0);
  };

  const handleClose = () => {
    resetData();
    onClose();
  };

  const handleStepCountChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = parseInt(e.target.value, 10);

    if (!isNaN(count) && count >= 0) {
      setStepCount(count);

      // Nếu đang ở chế độ chỉnh sửa, lấy dữ liệu từ Firebase
      if (type === "edit" && id) {
        const exerciseData = await fetchExerciseData(id);
        setSteps(updateSteps(exerciseData.steps || {}, count));
      } else {
        // Nếu không ở chế độ chỉnh sửa, chỉ cần tạo bước mới
        setSteps(createNewSteps(count));
      }
    } else {
      setStepCount(0);
      setSteps({});
    }
  };

  const updateSteps = (
    existingSteps: Record<string, { title: string; detail: string }>,
    count: number
  ) => {
    const updatedSteps: Record<string, { title: string; detail: string }> = {};

    // Giữ nguyên các bước đã có
    for (
      let i = 1;
      i <= Math.min(count, Object.keys(existingSteps).length);
      i++
    ) {
      updatedSteps[i] = existingSteps[i];
    }

    // Thêm các bước mới nếu số lượng bước tăng lên
    for (let i = Object.keys(existingSteps).length + 1; i <= count; i++) {
      updatedSteps[i] = { title: "", detail: "" };
    }

    return updatedSteps;
  };

  const createNewSteps = (count: number) => {
    const newSteps: Record<string, { title: string; detail: string }> = {};
    // Tạo mới tất cả các bước
    for (let i = 1; i <= count; i++) {
      newSteps[i] = { title: "", detail: "" };
    }
    return newSteps;
  };

  const handleStepChange = (
    key: string,
    field: "title" | "detail",
    value: string
  ) => {
    setSteps((prevSteps) => ({
      ...prevSteps,
      [key]: {
        ...prevSteps[key],
        [field]: value,
      },
    }));
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
      showAlert("Cần phải nhập tên bài tập!", "error");
      return false;
    }

    if (!descriptions) {
      showAlert("Cần phải nhập mô tả cho bài tập!", "error");
      return false;
    }

    // Kiểm tra từng bước trong steps
    for (const step of Object.values(steps)) {
      if (!step.title || !step.detail) {
        showAlert(
          "Cần phải nhập tiêu đề và chi tiết cho tất cả các bước!",
          "error"
        );
        return false;
      }
    }

    // Kiểm tra time và calo của mỗi mức độ khó
    if (
      difficulty.Beginner.calo <= 0 ||
      difficulty.Beginner.time <= 0 ||
      difficulty.Normal.calo <= 0 ||
      difficulty.Normal.time <= 0 ||
      difficulty.Professional.calo <= 0 ||
      difficulty.Professional.time <= 0
    ) {
      showAlert(
        "Giá trị calo và thời gian cho mỗi mức độ khó phải lớn hơn 0!",
        "error"
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const exerciseId = name; // Use exercise name as ID

    try {
      const existingExerciseDoc = doc(db, "Exercises", exerciseId);
      const existingDocSnapshot = await getDoc(existingExerciseDoc);

      if (type === "add" && existingDocSnapshot.exists()) {
        showAlert("Tên bài tập đã tồn tại. Vui lòng chọn tên khác!", "error");
        setLoading(false);
        return;
      }

      const storage = getStorage(); // Initialize storage here

      // Handle image upload
      let picURL: string | null = null;
      if (avatar && avatar.startsWith("data:")) {
        const storageRef = ref(storage, `workout_image/${exerciseId}.jpg`);
        await uploadString(storageRef, avatar, "data_url");
        picURL = await getDownloadURL(storageRef);
      } else if (type === "edit") {
        picURL = initialPic ?? null; // Ensure picURL is set to null if initialPic is undefined
      }

      // If picURL is still null, set a default value or handle accordingly
      if (picURL === null) {
        picURL = ""; // or any default value you prefer
      }

      // Handle video upload
      let newVideoURL: string | null = null;
      if (type === "edit" && isVideoDeleted) {
        newVideoURL = "";
      } else if (videoFile) {
        const videoRef = ref(storage, `workout_video/${videoFile.name}`);
        const uploadTask = uploadBytesResumable(videoRef, videoFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              newVideoURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(null);
            }
          );
        });
      } else {
        newVideoURL = videoURL;
      }

      const exerciseData = {
        name,
        descriptions,
        video: newVideoURL,
        difficulty,
        steps,
        pic: picURL || initialPic, // Ensure pic is set to a valid value
      };

      // Lưu dữ liệu vào Firestore
      await setDoc(existingExerciseDoc, exerciseData);
      showAlert("Tạo bài tập thành công", "success");

      onExerciseAdded();
      setTimeout(handleClose, 2000);
    } catch (error) {
      console.error("Error saving data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định.";
      showAlert(`Lỗi khi lưu dữ liệu: ${errorMessage}`, "error");
    } finally {
      setVideoFile(null);
      setVideoURL(null);
      setIsVideoDeleted(false);
      setLoading(false);
    }
  };

  const handleVideoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
      setVideoFile(file); // Save video file to state

      try {
        const storage = getStorage(); // Initialize storage here
        const storageRef = ref(storage, `workout_video/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file); // Use the file

        // Wait until the upload is complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error), // Handle errors during upload
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setVideoURL(downloadURL); // Save URL to state
              setIsVideoDeleted(false); // Mark new video as added
              resolve(null); // Complete upload
            }
          );
        });
      } catch (error) {
        console.error("Error uploading video:", error);
        showAlert("Lỗi khi tải lên video", "error");
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoURL(null); // Xóa URL video
    setVideoFile(null); // Xóa video file
    setIsVideoDeleted(true); // Đánh dấu video đã bị xóa
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
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {type === "add" ? "Thêm mới bài tập" : "Chỉnh sửa bài tập"}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 16, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" padding={2}>
            <CircularProgress />
          </Box>
        )}

        {/* Box chứa avatar, video và form inputs */}
        <Box display="flex" flexDirection="row" gap="20px" padding="16px">
          {/* Box chứa avatar và video */}
          <Box display="flex" flexDirection="column" width="35%" gap="20px">
            {/* Avatar Upload */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
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
                        Tải hình bài tập
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
            </Box>

            {/* Video Upload */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              height="310px"
              border="1px solid #E5E5E5"
              borderRadius="10px"
              padding="16px"
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width={200}
                height={250}
                position="relative"
                overflow="hidden" // Đảm bảo nội dung không thoát ra ngoài
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  width={170}
                  height={250}
                  borderRadius="100%"
                  marginTop="20px"
                >
                  <div>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{ marginBottom: "10px", width: "200px" }}
                    >
                      Upload files
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        multiple
                        style={{ display: "none" }}
                      />
                    </Button>
                    {videoURL && (
                      <div
                        style={{
                          maxWidth: "100%",
                          overflow: "auto",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        {videoURL && (
                          <video
                            width="100%"
                            controls
                            style={{ maxHeight: "150px", overflow: "auto" }}
                          >
                            <source src={videoURL} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <Button
                          onClick={handleRemoveVideo}
                          sx={{
                            color: "brown",
                            textAlign: "center",
                          }}
                        >
                          Loại bỏ
                        </Button>
                      </div>
                    )}
                  </div>
                </Box>
              </Box>
              <Typography
                align="center"
                sx={{ marginTop: "10px", fontSize: "14px", color: "#72808d" }}
              >
                *.mp4, *.avi, *.mov. <br />
                Tối đa 100 MB
              </Typography>
            </Box>
          </Box>

          {/* Form Inputs */}
          <Box
            display="flex"
            flexDirection="column"
            width="65%"
            border="1px solid #eaeaea"
            borderRadius="10px"
            padding="4px"
          >
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap="20px"
              padding="8px"
            >
              <TextField
                margin="dense"
                label="Tên bài tập"
                fullWidth
                required
                variant="outlined"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Nhập số lượng bước"
                type="number"
                value={stepCount}
                onChange={handleStepCountChange}
                variant="outlined"
                size="small"
              />
            </Box>
            {Object.entries(steps).map(([key, step]) => (
              <Box key={key} display="flex" flexDirection="column">
                <TextField
                  label={`Tiêu đề bước ${key}`}
                  value={step.title}
                  required
                  onChange={(e) =>
                    handleStepChange(key, "title", e.target.value)
                  }
                  variant="outlined"
                  size="small"
                  margin="normal"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "brown",
                      },
                      "&:hover fieldset": {
                        borderColor: "brown",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "brown",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                <TextField
                  label={`Chi tiết bước ${key}`}
                  value={step.detail}
                  onChange={(e) =>
                    handleStepChange(key, "detail", e.target.value)
                  }
                  variant="outlined"
                  size="medium"
                  multiline
                  rows={3}
                  fullWidth
                  required
                  margin="normal"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "100px",
                      maxHeight: "100px",
                      overflow: "hidden",
                      resize: "none",
                    },
                    "& textarea": {
                      wordBreak: "break-word",
                      maxHeight: "120px",
                      overflow: "hidden",
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      position: "absolute",
                      top: "-10px",
                      left: "12px",
                      background: "white",
                      padding: "0 4px",
                      transform: "none",
                      fontSize: "14px",
                    },
                  }}
                />
              </Box>
            ))}

            {/* Difficulty Sections */}
            {(["Beginner", "Normal", "Professional"] as const).map((level) => (
              <DifficultySection
                key={level}
                level={level}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />
            ))}

            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              gap="50px"
              padding="8px"
            >
              <TextField
                margin="dense"
                label="Mô tả bài tập"
                fullWidth
                required
                variant="outlined"
                size="medium"
                value={descriptions}
                onChange={(e) => setDescriptions(e.target.value)}
                multiline
                rows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "120px",
                    maxHeight: "120px",
                    overflow: "hidden",
                    resize: "none",
                  },
                  "& textarea": {
                    wordBreak: "break-word",
                    maxHeight: "120px",
                    overflow: "hidden",
                  },
                }}
                InputLabelProps={{
                  sx: {
                    position: "absolute",
                    top: "-10px",
                    left: "12px",
                    background: "white",
                    padding: "0 4px",
                    transform: "none",
                    fontSize: "14px",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Save Button */}
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
      </DialogContent>
    </Dialog>
  );
};

export default AddNewPopup;

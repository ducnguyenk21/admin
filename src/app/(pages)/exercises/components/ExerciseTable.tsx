import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  TablePagination,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CustomDeleteDialog from "@/app/(pages)/modal/delete-dialog";
import getExercises from "@/app/core/hooks/getExercises";
import {
  collection,
  doc,
  deleteDoc,
  getFirestore,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import AddNewPopup from "@/app/(pages)/modal/exercise-add-dialog";

interface Difficulty {
  calo: number;
  rep: number;
  time: number;
}

interface DifficultyLevels {
  Beginner: Difficulty;
  Normal: Difficulty;
  Professional: Difficulty;
}

interface Step {
  detail: string;
  title: string;
}

interface Row {
  id: string;
  pic: string;
  name: string;
  difficultyLevels: DifficultyLevels;
  steps?: Record<string, Step>;
  descriptions?: string;
  video?: string;
}

interface UserTableProps {
  refresh: boolean;
}

interface AlertState {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  visible: boolean;
}

type DifficultyLevel = "Beginner" | "Normal" | "Professional";

const ExerciseTable: React.FC<UserTableProps> = ({ refresh }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Row | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    severity: "error",
    visible: false,
  });
  const [filters, setFilters] = useState({
    name: "",
    difficulty: "Beginner" as DifficultyLevel,
  });

  const showAlert = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setAlert({ message, severity, visible: true });
  };

  const fetchRows = async () => {
    try {
      const exercises = await getExercises();
      const formattedExercises: Row[] = exercises.map((exercise) => ({
        id: exercise.name,
        pic: exercise.pic,
        name: exercise.name,
        difficultyLevels: exercise.difficulty,
        steps: exercise.steps || {},
        descriptions: exercise.descriptions,
        video: exercise.video,
      }));

      setRows(formattedExercises);
      setFilteredRows(formattedExercises);
      setTotalRows(formattedExercises.length);
    } catch (error) {
      console.error("Cannot fetch exercise list:", error);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [refresh]);

  useEffect(() => {
    const result = rows.filter((row) => {
      const matchesName = row.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesDifficulty = filters.difficulty
        ? row.difficultyLevels[filters.difficulty] !== undefined
        : true;
      return matchesName && matchesDifficulty;
    });

    setFilteredRows(result);
    setTotalRows(result.length);
    setPage(0); // Reset to the first page on filter change
  }, [filters, rows]);

  const handleOpenAdd = (id: string) => {
    const exercise = rows.find((row) => row.id === id);
    if (exercise) {
      setExerciseToEdit(exercise);
      setOpenAdd(true);
    } else {
      console.error(`Exercise with ID: ${id} not found.`);
    }
  };

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    setExerciseToEdit(null);
    fetchRows();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const handleDeleteSelected = async () => {
    setLoading(true);
    const storage = getStorage();
    const db = getFirestore();

    try {
      for (const exerciseName of selected) {
        const exerciseDocRef = doc(db, "Exercises", exerciseName);
        const exerciseDocSnap = await getDoc(exerciseDocRef);

        if (exerciseDocSnap.exists()) {
          const exerciseData = exerciseDocSnap.data();
          const videoURL = exerciseData.video;

          await deleteDoc(exerciseDocRef);

          if (videoURL) {
            const videoFileName = videoURL.substring(
              videoURL.lastIndexOf("/") + 1,
              videoURL.indexOf("?")
            );
            const videoRef = ref(storage, `workout_video/${videoFileName}`);

            try {
              await deleteObject(videoRef);
              console.log(`Deleted video for ${exerciseName}`);
            } catch (error) {
              if (
                (error as FirebaseError).code === "storage/object-not-found"
              ) {
                console.log(`Video for ${exerciseName} not found`);
              } else {
                console.error(
                  `Error deleting video for ${exerciseName}:`,
                  error
                );
                showAlert("Error deleting exercise", "error");
              }
            }
          }

          const imageRef = ref(storage, `workout_image/${exerciseName}.jpg`);
          try {
            await deleteObject(imageRef);
            console.log(`Deleted image for ${exerciseName}`);
          } catch (error) {
            if ((error as FirebaseError).code === "storage/object-not-found") {
              console.log(`Image for ${exerciseName} not found`);
            } else {
              console.error(`Error deleting image for ${exerciseName}:`, error);
              showAlert(`Error deleting image for ${exerciseName}`, "error");
            }
          }
        } else {
          console.log(`Exercise ${exerciseName} does not exist.`);
          showAlert(`Exercise ${exerciseName} does not exist.`, "warning");
        }
      }

      showAlert("Successfully deleted exercises!", "success");
      setOpenSnackbar(true);
      setSelected([]);
      fetchRows();
    } catch (error) {
      console.error("Error deleting exercises:", error);
      showAlert("Error deleting exercises!", "error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const isSelected = (id: string) => selected.includes(id);

  const handleCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const newSelected = isSelected(id)
      ? selected.filter((selectedId) => selectedId !== id)
      : [...selected, id];
    setSelected(newSelected);
  };

  // Calculate paginated rows
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <TableContainer
        sx={{ flexGrow: 1, maxHeight: "120vh", overflow: "auto" }}
      >
        <Table sx={{ width: "100%" }} aria-label="exercise table">
          <TableHead sx={{ background: "#f4f6f8" }}>
            <TableRow>
              <TableCell
                sx={{ padding: "4px 8px", width: "10%", borderBottom: "none" }}
              />
              <TableCell sx={{ borderBottom: "none", width: "5%" }} />
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "20%",
                  borderBottom: "none",
                }}
              >
                Tên bài tập
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "15%",
                  borderBottom: "none",
                }}
              >
                Độ khó
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "10%",
                  borderBottom: "none",
                }}
              >
                Calo
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "10%",
                  borderBottom: "none",
                }}
              >
                Thời gian
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "10%",
                  borderBottom: "none",
                }}
              >
                Số Rep
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{ padding: "4px 8px", width: "10%", borderBottom: "none" }}
              />
              <TableCell
                sx={{ padding: "4px 8px", width: "5%", borderBottom: "none" }}
              />
              <TableCell>
                <TextField
                  size="small"
                  sx={{ background: "white" }}
                  fullWidth
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  select
                  sx={{ background: "white" }}
                  fullWidth
                  name="difficulty"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="Beginner">Dễ</MenuItem>
                  <MenuItem value="Normal">Trung bình</MenuItem>
                  <MenuItem value="Professional">Khó</MenuItem>
                </TextField>
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => {
                const difficultyData = row.difficultyLevels[filters.difficulty];
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f1f1f1" },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={(event) =>
                            handleCheckboxClick(event, row.id)
                          }
                        />
                        <IconButton onClick={() => handleOpenAdd(row.id)}>
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={row.pic}
                        alt="Avatar"
                        sx={{ height: "40px", width: "40px" }}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{filters.difficulty}</TableCell>
                    <TableCell>{difficultyData?.calo || "0"}</TableCell>
                    <TableCell>{difficultyData?.time || "0"}</TableCell>
                    <TableCell>{difficultyData?.rep || "0"}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: 2 }}
      >
        <Grid item>
          <IconButton
            sx={{
              color: "#919eab",
              marginLeft: "10px",
              gap: "10px",
              fontSize: "14px",
            }}
          >
            <FileDownloadOutlinedIcon />
            Export Data
          </IconButton>
        </Grid>
        <Grid item>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>

      <AddNewPopup
        open={openAdd}
        onClose={handleCloseOpenAdd}
        type="edit"
        onExerciseAdded={fetchRows}
        id={exerciseToEdit?.id}
        name={exerciseToEdit?.name}
        descriptions={exerciseToEdit?.descriptions || ""}
        pic={exerciseToEdit?.pic}
        difficulty={exerciseToEdit?.difficultyLevels}
        steps={exerciseToEdit?.steps}
        video={exerciseToEdit?.video || ""}
      />

      <CustomDeleteDialog
        open={selected.length > 0}
        handleClose={() => setSelected([])}
        quantity={selected.length}
        onDelete={handleDeleteSelected}
      />
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
    </Paper>
  );
};

export default ExerciseTable;

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
  Switch,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CustomDeleteDialog from "@/app/(pages)/modal/delete-dialog";
import getUsers from "@/app/core/hooks/getUsers";
import AddNewPopup from "@/app/(pages)/modal/user-add-dialog";
import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

interface Row {
  uid: string;
  pic: string;
  email: string;
  gender: string;
  level: string;
  role: string;
  activate: boolean;
  fname?: string;
  date_of_birth?: string;
  lname?: string;
  height?: string;
  weight?: string;
}

interface UserTableProps {
  refresh: boolean;
}

interface AlertState {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  visible: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ refresh }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Row | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    severity: "error",
    visible: false,
  });
  const [filters, setFilters] = useState({
    email: "",
    gender: "All",
    level: "",
    role: "All",
    activate: "All",
  });

  const showAlert = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setAlert({ message, severity, visible: true });
  };

  const fetchRows = async () => {
    try {
      const users = await getUsers();
      setRows(users);
      setFilteredRows(users);
      setTotalRows(users.length);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showAlert("Failed to load users", "error");
    }
  };

  useEffect(() => {
    fetchRows();
  }, [refresh]);

  useEffect(() => {
    const result = rows.filter((row) => {
      const matchesEmail = row.email
        .toLowerCase()
        .includes(filters.email.toLowerCase());
      const matchesGender =
        filters.gender === "All" || row.gender === filters.gender;
      const matchesLevel = row.level
        .toLowerCase()
        .includes(filters.level.toLowerCase());
      const matchesActivate =
        filters.activate === "All" ||
        (filters.activate === "True" && row.activate) ||
        (filters.activate === "False" && !row.activate);
      const matchesRole = filters.role === "All" || row.role === filters.role;

      return (
        matchesEmail &&
        matchesGender &&
        matchesLevel &&
        matchesActivate &&
        matchesRole
      );
    });
    setFilteredRows(result);
    setTotalRows(result.length);
  }, [filters, rows]);

  const onUserAdded = () => {
    fetchRows(); // Fetch updated user data
  };

  const handleOpenAdd = (uid: string) => {
    const user = rows.find((row) => row.uid === uid);
    if (user) {
      setUserToEdit(user);
      setOpenAdd(true);
    } else {
      console.error(`User with UID: ${uid} not found.`);
    }
  };

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    setUserToEdit(null); // Reset the userToEdit state
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page on rows per page change
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selected.map(async (uid) => {
          await deleteDoc(doc(db, "users", uid)); // Directly delete user from Firestore
        })
      );

      showAlert("Xóa người dùng thành công", "success");
      setOpenSnackbar(true);
      setSelected([]);
      fetchRows(); // Refresh users after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert("Xóa không thành công", "error");
      setOpenSnackbar(true);
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

  const handleSwitchChange = async (uid: string, currentStatus: boolean) => {
    try {
      const userDoc = doc(collection(db, "users"), uid);
      await updateDoc(userDoc, { activate: !currentStatus });
      fetchRows(); // Refresh users after activation status change
    } catch (error) {
      console.error("Failed to update user activation status:", error);
      showAlert("Failed to update activation status", "error");
    }
  };

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
        sx={{ flexGrow: 1, maxHeight: "100vh", overflow: "auto" }}
      >
        <Table sx={{ width: "100%" }} aria-label="user table">
          <TableHead sx={{ background: "#f4f6f8" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: "5%" }} />
              <TableCell sx={{ width: "5%" }} />
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "30%",
                  borderBottom: "none",
                }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "10%",
                  borderBottom: "none",
                }}
              >
                Giới tính
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "15%",
                  borderBottom: "none",
                }}
              >
                Level
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "15%",
                  borderBottom: "none",
                }}
              >
                Vai trò
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  padding: "4px 8px",
                  width: "10%",
                  borderBottom: "none",
                }}
              >
                Hoạt động
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell>
                <TextField
                  size="small"
                  sx={{ background: "white" }}
                  fullWidth
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  select
                  sx={{ background: "white" }}
                  fullWidth
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  sx={{ background: "white" }}
                  fullWidth
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  select
                  sx={{ background: "white" }}
                  fullWidth
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="user">Người dùng</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  select
                  sx={{ background: "white" }}
                  fullWidth
                  name="activate"
                  value={filters.activate}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="True">On</MenuItem>
                  <MenuItem value="False">Off</MenuItem>
                </TextField>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    key={row.uid}
                    sx={{
                      height: "45px",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f1f1f1" },
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Checkbox
                          checked={isSelected(row.uid)}
                          onChange={(event) =>
                            handleCheckboxClick(event, row.uid)
                          }
                        />
                        <IconButton onClick={() => handleOpenAdd(row.uid)}>
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
                    <TableCell
                      sx={{ padding: "4px 16px", borderBottom: "none" }}
                    >
                      {row.email}
                    </TableCell>
                    <TableCell
                      sx={{ padding: "4px 10px", borderBottom: "none" }}
                    >
                      {row.gender}
                    </TableCell>
                    <TableCell
                      sx={{ padding: "4px 16px", borderBottom: "none" }}
                    >
                      {row.level}
                    </TableCell>
                    <TableCell
                      sx={{ padding: "4px 16px", borderBottom: "none" }}
                    >
                      {row.role}
                    </TableCell>
                    <TableCell
                      sx={{ padding: "4px 8px", borderBottom: "none" }}
                    >
                      <Switch
                        checked={row.activate}
                        onChange={() =>
                          handleSwitchChange(row.uid, row.activate)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                  No data available
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
        uid={userToEdit?.uid}
        onUserAdded={onUserAdded}
        activate={userToEdit?.activate}
        email={userToEdit?.email}
        date_of_birth={userToEdit?.date_of_birth}
        fname={userToEdit?.fname}
        lname={userToEdit?.lname}
        gender={userToEdit?.gender}
        height={userToEdit?.height}
        level={userToEdit?.level}
        weight={userToEdit?.weight}
        role={userToEdit?.role}
        pic={userToEdit?.pic || ""}
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
      <CustomDeleteDialog
        open={selected.length > 0}
        handleClose={() => setSelected([])}
        quantity={selected.length}
        onDelete={handleDeleteSelected}
      />
    </Paper>
  );
};

export default UserTable;

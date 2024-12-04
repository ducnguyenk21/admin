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
  Grid,
  Avatar,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CustomDeleteDialog from "@/app/(pages)/modal/delete-dialog"; // Adjust import path as necessary
import AddNewPopup from "@/app/(pages)/modal/tool-add-dialog"; // Adjust import path as necessary
import getTools from "@/app/core/hooks/getTools"; // Adjust import path as necessary
import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc, getDoc, getFirestore } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

interface Tool {
  id: string;
  name: string;
  pic: string;
}

interface ToolsTableProps {
  refresh: boolean; // To trigger data refresh
}

const ToolsTable: React.FC<ToolsTableProps> = ({ refresh }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [toolToEdit, setToolToEdit] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    severity: "success" | "error";
    visible: boolean;
  }>({
    message: "",
    severity: "error",
    visible: false,
  });

  const showAlert = (message: string, severity: "success" | "error") => {
    setAlert({ message, severity, visible: true });
  };

  const fetchTools = async () => {
    try {
      const toolsData = await getTools();
      setTools(toolsData);
      setTotalRows(toolsData.length); // Set total rows based on fetched data
    } catch (error) {
      console.error("Failed to fetch tools:", error);
      showAlert("Failed to fetch tools", "error");
    }
  };

  useEffect(() => {
    fetchTools();
  }, [refresh]); // Re-fetch tools when refresh changes

  const handleOpenAdd = (id: string) => {
    const tool = tools.find((t) => t.id === id);
    if (tool) {
      setToolToEdit(tool);
      setOpenAdd(true);
    } else {
      console.error(`Tool with ID: ${id} not found.`);
    }
  };

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    fetchTools(); // Refresh tools after adding/editing
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

  // Define the function to be called when an exercise is added
  const handleExerciseAdded = () => {
    setOpenAdd(false);
    fetchTools();
  };

  const handleDeleteSelected = async () => {
    setLoading(true);
    const storage = getStorage();
    const db = getFirestore();

    try {
      for (const toolId of selected) {
        const toolDocRef = doc(db, "Tools", toolId);
        const docSnap = await getDoc(toolDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const picURL = data.pic;

          await deleteDoc(toolDocRef);

          if (picURL) {
            const imageRef = ref(storage, picURL);
            try {
              await deleteObject(imageRef);
              console.log(`Deleted image for tool ${toolId}`);
            } catch (error) {
              if (
                (error as FirebaseError).code === "storage/object-not-found"
              ) {
                console.log(`Image for tool ${toolId} not found`);
              } else {
                console.error(
                  `Error deleting image for tool ${toolId}:`,
                  error
                );
                showAlert(`Error deleting image for tool ${toolId}`, "error");
              }
            }
          }
        } else {
          console.log(`Tool with ID ${toolId} does not exist.`);
          showAlert(`Tool with ID ${toolId} does not exist.`, "error");
        }
      }

      showAlert("Successfully deleted", "success");
      setOpenSnackbar(true);
      setSelected([]);
      fetchTools();
    } catch (error) {
      console.error("Error deleting tools:", error);
      showAlert(`Failed to delete tools:`, "error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
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

  // Calculate paginated tools
  const paginatedTools = tools.slice(
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
        sx={{ flexGrow: 1, maxHeight: "100vh", overflow: "auto" }}
      >
        <Table sx={{ width: "100%" }} aria-label="tools table">
          <TableHead sx={{ background: "#f4f6f8" }}>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTools.length > 0 ? (
              paginatedTools.map((tool) => (
                <TableRow
                  key={tool.id}
                  sx={{
                    height: "45px",
                    "&:hover": { backgroundColor: "#f1f1f1" },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Checkbox
                        checked={isSelected(tool.id)}
                        onChange={(event) =>
                          handleCheckboxClick(event, tool.id)
                        }
                      />
                      <IconButton onClick={() => handleOpenAdd(tool.id)}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Avatar
                      sx={{ height: "40px", width: "40px", overflow: "hidden" }}
                      imgProps={{
                        style: {
                          objectFit: "contain",
                          width: "100%",
                          height: "100%",
                        },
                      }}
                      src={tool.pic}
                      alt="Avatar"
                    />
                  </TableCell>
                  <TableCell>{tool.name}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: "center" }}>
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
        onExerciseAdded={handleExerciseAdded} // Pass the function here
        id={toolToEdit?.id} // Pass the ID of the tool being edited
        name={toolToEdit?.name} // Pass the name of the tool being edited
        pic={toolToEdit?.pic} // Pass the picture of the tool being edited
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

export default ToolsTable;

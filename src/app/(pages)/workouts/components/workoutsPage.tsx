import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Grid,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Layout from "@/app/core/components/ui/layout";
import WorkoutsTable from "./workoutsTable"; // Đảm bảo tên thành phần bắt đầu bằng chữ hoa
import AddNewPopup from "@/app/(pages)/modal/workout-add-dialog";

const ToolsExercisePage: React.FC = () => {
  const [openImport, setOpenImport] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    setRefreshTable((prev) => !prev);
  };

  const handleOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseImport = () => {
    setOpenImport(false);
    setRefreshTable((prev) => !prev);
  };

  const handleOpenImport = () => {
    setOpenImport(true);
  };

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "110vh",
          flexDirection: "column",
        }}
      >
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
        >
          <AppBar
            position="static"
            sx={{
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              backgroundColor: "white",
              height: "57px",
            }}
          >
            <Toolbar>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "black",
                  flexGrow: 1,
                }}
              >
                Quản Lý Nhóm Bài Tập
              </Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
                sx={{ textTransform: "none", width: "125px" }}
              >
                Thêm mới
              </Button>
            </Toolbar>
          </AppBar>
          <Grid container spacing={3} sx={{ mt: 2 }}></Grid>
          <Grid container spacing={3} sx={{ height: "85%" }}>
            <Grid item xs={12} sx={{ flexGrow: 1 }}>
              <WorkoutsTable refresh={refreshTable} />
              {/* Sử dụng chữ hoa */}
            </Grid>
          </Grid>
        </Box>
        <AddNewPopup
          open={openAdd}
          onClose={handleCloseOpenAdd}
          type="add" // or "edit" based on the context
          onWorkoutAdded={() => setRefreshTable((prev) => !prev)}
          refresh={refreshTable} // if needed
          initialData={null} // or pass the actual initial data if editing
        />
      </Box>
    </Layout>
  );
};

export default ToolsExercisePage; // Đảm bảo tên cũng được viết hoa

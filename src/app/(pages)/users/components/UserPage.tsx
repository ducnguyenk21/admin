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
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Layout from "@/app/core/components/ui/layout";
import UserTable from "./UserTable"; // Giữ lại nếu bạn cần hiển thị bảng người dùng
import AddNewPopup from "@/app/(pages)/modal/user-add-dialog"; // Popup thêm mới người dùng
// import ImportDialog from "@/app/(pages)/modal/user-import"; // Popup nhập người dùng

const HomePage: React.FC = () => {
  const [openImport, setOpenImport] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleCloseOpenAdd = () => {
    setOpenAdd(false);
    setRefreshTable((prev) => !prev); // Tạo toggle refreshTable
  };

  const handleOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseImport = () => {
    setOpenImport(false);
    setRefreshTable((prev) => !prev); // Tạo toggle refreshTable
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
                Quản Lý Người Dùng
              </Typography>
              {/* <Button
                variant="outlined"
                color="primary"
                startIcon={<FileUploadOutlinedIcon />}
                onClick={handleOpenImport}
                sx={{
                  textTransform: "none",
                  width: "125px",
                  marginRight: "25px",
                  border: "2px solid rgba(41, 121, 255, 0.5)",
                }}
              >
                Import
              </Button> */}
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
              <UserTable refresh={refreshTable} />
            </Grid>
          </Grid>
        </Box>
        <AddNewPopup
          open={openAdd}
          onClose={handleCloseOpenAdd}
          type="add"
          onUserAdded={() => setRefreshTable((prev) => !prev)} // Sử dụng setRefreshTable trực tiếp
        />
        {/* <ImportDialog open={openImport} handleClose={handleCloseImport} /> */}
      </Box>
    </Layout>
  );
};

export default HomePage;

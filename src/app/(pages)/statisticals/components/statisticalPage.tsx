import React, { useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import Layout from "@/app/core/components/ui/layout";
import getUsers from "@/app/core/hooks/getUsers";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

const StatisticalPage: React.FC = () => {
  const [refreshTable, setRefreshTable] = useState(false);
  const [genderData, setGenderData] = useState({
    Male: 0,
    Female: 0,
  });
  const [heightData, setHeightData] = useState({
    Male: 0,
    Female: 0,
  });
  const [weightData, setWeightData] = useState({
    Male: 0,
    Female: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();

        // Thống kê giới tính
        const maleCount = users.filter((user) => user.gender === "Male").length;
        const femaleCount = users.filter(
          (user) => user.gender === "Female"
        ).length;
        setGenderData({ Male: maleCount, Female: femaleCount });

        // Tính chiều cao trung bình
        const maleHeights = users
          .filter(
            (user) => user.gender === "Male" && !isNaN(Number(user.height))
          )
          .map((user) => Number(user.height));

        const femaleHeights = users
          .filter(
            (user) => user.gender === "Female" && !isNaN(Number(user.height))
          )
          .map((user) => Number(user.height));

        setHeightData({
          Male: maleHeights.length
            ? parseFloat(
                (
                  maleHeights.reduce((a, b) => a + b, 0) / maleHeights.length
                ).toFixed(2)
              )
            : 0,
          Female: femaleHeights.length
            ? parseFloat(
                (
                  femaleHeights.reduce((a, b) => a + b, 0) /
                  femaleHeights.length
                ).toFixed(2)
              )
            : 0,
        });

        // Tính cân nặng trung bình
        const maleWeights = users
          .filter(
            (user) => user.gender === "Male" && !isNaN(Number(user.weight))
          )
          .map((user) => Number(user.weight));

        const femaleWeights = users
          .filter(
            (user) => user.gender === "Female" && !isNaN(Number(user.weight))
          )
          .map((user) => Number(user.weight));

        setWeightData({
          Male: maleWeights.length
            ? parseFloat(
                (
                  maleWeights.reduce((a, b) => a + b, 0) / maleWeights.length
                ).toFixed(2)
              )
            : 0,
          Female: femaleWeights.length
            ? parseFloat(
                (
                  femaleWeights.reduce((a, b) => a + b, 0) /
                  femaleWeights.length
                ).toFixed(2)
              )
            : 0,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [refreshTable]);

  // Dữ liệu cho biểu đồ
  const pieData = [
    { id: "Male", value: genderData.Male },
    { id: "Female", value: genderData.Female },
  ];

  const barData = [
    {
      id: "Height",
      data: [heightData.Male, heightData.Female],
      color: "#02B2AF",
    },
    {
      id: "Weight",
      data: [weightData.Male, weightData.Female],
      color: "#2E96FF",
    },
  ];

  const totalUsers = genderData.Male + genderData.Female;

  const pieParams = {
    height: 250,
    margin: { right: 5 },
    colors: ["#3f51b5", "#f50057"],
    slotProps: { legend: { hidden: true }, tooltip: { show: true } },
  };

  return (
    <Layout>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "200%",
          flexDirection: "column",
          bgcolor: "#f5f5f5",
          padding: 3,
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            sx={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#333",
              mb: 4,
              textAlign: "center",
            }}
          >
            📊 Thống kê người dùng
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{
                  padding: 3,
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" color="text.primary">
                    Thống kê giới tính
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => setRefreshTable((prev) => !prev)}
                    sx={{ ml: 2 }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Stack>
                <PieChart series={[{ data: pieData }]} {...pieParams} />

                {/* Phần Chú Thích */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Tổng số người dùng: {totalUsers}
                  </Typography>
                  <Stack direction="row" spacing={2} mt={1}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#3f51b5",
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body1">
                        Male: {genderData.Male}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#f50057",
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body1">
                        Female: {genderData.Female}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                elevation={4}
                sx={{ padding: 3, borderRadius: 3, backgroundColor: "#fff" }}
              >
                <Typography variant="h6" color="text.primary" mb={2}>
                  Biểu Đồ So sánh Chiều cao và Cân nặng
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center", // Center the chart horizontally
                    alignItems: "center", // Center the chart vertically (if needed)
                  }}
                >
                  <BarChart
                    xAxis={[{ scaleType: "band", data: ["Male", "Female"] }]}
                    series={barData}
                    width={500}
                    height={300}
                  />
                </Box>

                {/* Phần Chú Thích cho Biểu đồ */}
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#02B2AF", // Chiều cao
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body1">Chiều cao</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#2E96FF", // Cân nặng
                          borderRadius: "50%",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body1">Cân nặng</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Grid></Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
};

export default StatisticalPage;

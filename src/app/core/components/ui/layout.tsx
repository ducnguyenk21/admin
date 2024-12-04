import React, { ReactNode } from "react";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import dynamic from "next/dynamic";
import styles from "@/app/core/components/Auth/Page.module.css";

const drawerWidth = 285;
const theme = createTheme();

const Menu = dynamic(() => import("@/app/core/components/Auth/Sidebar"), {
  ssr: false,
});

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [open, setOpen] = React.useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CssBaseline />
        <Menu
          drawerWidth={drawerWidth}
          open={open}
          handleDrawerToggle={handleDrawerToggle}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: "auto", // Cho phép cuộn nội dung chính nếu quá dài
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;

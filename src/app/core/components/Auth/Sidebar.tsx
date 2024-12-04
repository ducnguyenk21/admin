import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  Avatar,
  Popover,
  ListItemText,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  FiberManualRecord,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import styles from "./Page.module.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter, usePathname } from "next/navigation"; // usePathname để theo dõi URL
import { useAuth } from "@/app/core/hooks/AuthContext";
import EditInformationDialog from "@/app/(pages)/modal/user-add-dialog";

// Define User interface
interface User {
  uid: string;
  email: string;
  date_of_birth: string;
  fname: string;
  lname: string;
  gender: string;
  height: string;
  level: string;
  weight: string;
  role: string;
  pic: string | null;
  activate: boolean;
}

interface MenuProps {
  drawerWidth: number;
  open: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar: React.FC<MenuProps> = ({
  drawerWidth,
  open,
  handleDrawerToggle,
}) => {
  const [openSubMenu, setOpenSubMenu] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Theo dõi đường dẫn hiện tại

  useEffect(() => {
    const userInfo: User = {
      uid: localStorage.getItem("user_uid") || "",
      email: localStorage.getItem("user_email") || "",
      date_of_birth: localStorage.getItem("user_dob") || "",
      fname: localStorage.getItem("user_fname") || "",
      lname: localStorage.getItem("user_lname") || "",
      gender: localStorage.getItem("user_gender") || "",
      height: localStorage.getItem("user_height") || "",
      level: localStorage.getItem("user_level") || "",
      weight: localStorage.getItem("user_weight") || "",
      role: localStorage.getItem("user_role") || "",
      pic: localStorage.getItem("user_pic"),
      activate: localStorage.getItem("user_activate") === "true",
    };

    setAvatar(userInfo.pic);
    setFullName(`${userInfo.lname} ${userInfo.fname}`.trim());
    setUserToEdit(userInfo);
  }, []);

  useEffect(() => {
    // Tự động cập nhật selectedIndex khi pathname thay đổi
    const currentIndex = menuItems.findIndex((item) => item.path === pathname);
    setSelectedIndex(currentIndex);
  }, [pathname]);

  const handleNavigation = useCallback(
    (path: string, index: number) => {
      setSelectedIndex(index); // Cập nhật selectedIndex ngay lập tức
      router.push(path); // Điều hướng tới đường dẫn
    },
    [router]
  );

  const handleClick = () => setOpenSubMenu((prev) => !prev);
  const handleArrowClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClosePopover = () => setAnchorEl(null);

  const handleLogOut = async () => await logout();
  const handleUserAdded = () => console.log("User added or updated");

  const openPopover = Boolean(anchorEl);
  const popoverId = openPopover ? "simple-popover" : undefined;

  const menuItems = useMemo(
    () => [
      { path: "/users", name: "Người dùng" },
      { path: "/exercises", name: "Bài tập" },
      { path: "/workouts", name: "Nhóm bài tập" },
      { path: "/toolsExercise", name: "Dụng cụ tập luyện" },
      { path: "/statisticals", name: "Thống kê" },
    ],
    []
  );

  return (
    <Box
      sx={{
        width: open ? drawerWidth : 56,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : 56,
          boxSizing: "border-box",
          backgroundColor: "#14317f",
          transition: "width 0.3s ease",
        },
        height: "100vh",
        overflowX: "hidden",
        backgroundColor: "#14317f",
        position: "relative",
        transition: "width 0.3s ease",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: [1],
          backgroundColor: "#14317f",
          gap: "5px",
          height: "90px",
          width: "100%",
        }}
      >
        {open && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              textAlign: "center",
            }}
          >
            <Avatar
              className={styles.logo}
              src="/logo_image.png"
              alt="Logo"
              style={{ marginRight: "8px" }}
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              className={styles.titleTxt}
              sx={{ color: "#ffffff", fontSize: "30px" }}
            >
              Fitness Workout
              <br />
              Management
            </Typography>
          </div>
        )}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerToggle}
          sx={{ color: "white", marginRight: "-5px" }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Divider sx={{ borderColor: "#ffffff" }} />
      <List>
        <ListItemButton
          onClick={handleClick}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ListItemIcon>
            <SettingsIcon sx={{ color: "#ffffff" }} />
          </ListItemIcon>
          {open && (
            <ListItemText
              primary="Hệ thống"
              sx={{ color: "#ffffff", marginLeft: "8px" }}
            />
          )}
          {open ? (
            <ExpandLess sx={{ color: "#ffffff" }} />
          ) : (
            <ExpandMore sx={{ color: "#ffffff" }} />
          )}
        </ListItemButton>
        {open && (
          <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menuItems.map((item, index) => (
                <ListItemButton
                  key={item.path}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: selectedIndex === index ? "#ffffff" : "#ffffff",
                    backgroundColor:
                      selectedIndex === index ? "#1976d2" : "transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedIndex === index ? "#1976d2" : "#f0f0f0",
                      color: "#000000",
                    },
                  }}
                  onClick={() => handleNavigation(item.path, index)}
                >
                  <ListItemIcon>
                    <FiberManualRecord
                      sx={{
                        color: "#ffffff",
                        width: "4px",
                        marginLeft: "10px",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </List>

      <Box sx={{ position: "absolute", bottom: 0, color: "#ffffff" }}>
        <Divider
          sx={{ borderColor: "#ffffff", width: "260px", marginLeft: "10px" }}
        />
        <Box
          sx={{ alignItems: "center", flexDirection: "row", display: "flex" }}
        >
          <ListItemButton
            component="li"
            sx={{ width: "230px", paddingLeft: "10px" }}
          >
            <ListItemIcon>
              {avatar ? (
                <Avatar
                  sx={{ height: "40px", width: "40px" }}
                  src={avatar}
                  alt="Avatar"
                />
              ) : (
                <PersonIcon
                  sx={{ color: "#ffffff", height: "40px", width: "40px" }}
                />
              )}
            </ListItemIcon>
            {open && <ListItemText primary={fullName || "Not Found"} />}
          </ListItemButton>
          <IconButton onClick={handleArrowClick}>
            <ArrowForwardIosIcon
              sx={{
                color: "#ffffff",
                height: "20px",
                width: "20px",
                marginLeft: "15px",
              }}
            />
          </IconButton>
        </Box>
        <Divider
          sx={{ borderColor: "#ffffff", width: "260px", marginLeft: "10px" }}
        />
      </Box>

      <Popover
        id={popoverId}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <List sx={{ width: "200px" }}>
          <ListItemButton onClick={handleLogOut}>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
          <ListItemButton onClick={() => setEditDialogOpen(true)}>
            <ListItemText primary="Thông tin tài khoản" />
          </ListItemButton>
        </List>
      </Popover>

      <EditInformationDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        type="edit"
        uid={userToEdit?.uid || ""}
        onUserAdded={handleUserAdded}
        activate={userToEdit?.activate || false}
        email={userToEdit?.email || ""}
        date_of_birth={userToEdit?.date_of_birth || ""}
        fname={userToEdit?.fname || ""}
        lname={userToEdit?.lname || ""}
        gender={userToEdit?.gender || ""}
        height={userToEdit?.height || ""}
        level={userToEdit?.level || ""}
        weight={userToEdit?.weight || ""}
        role={userToEdit?.role || ""}
        pic={userToEdit?.pic || ""}
      />
    </Box>
  );
};

export default Sidebar;

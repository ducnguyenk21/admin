//page.tsx
"use client";
import React from "react";
import { Box } from "@mui/material";
import Image from "next/image";
import { ToastContainer } from "react-toastify";
import LoginForm from "./components/LoginForm";
import { AuthProvider } from "@/app/core/hooks/AuthContext";

export default function Login() {
  return (
    <>
      <AuthProvider>
        <Box display="flex" height="100vh">
          <ToastContainer
            position="top-right" // Vị trí của thông báo
            style={{ maxWidth: "550px", width: "100%" }} // Tăng chiều rộng tối đa
          />

          {/* Left Side - Image (2/3 of screen width) */}
          <Box
            flex={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="white"
            p={2}
            flexShrink={1}
          >
            <Image
              src="/login_image.png"
              layout="responsive"
              width={1096}
              height={900}
              alt="Login Image"
              className="object-contain max-w-full max-h-full"
            />
          </Box>

          {/* Right Side - Form (1/3 of screen width) */}
          <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={4}
            bgcolor="background.paper" // Sử dụng màu nền từ theme
          >
            <Box
              width="100%"
              maxWidth={400}
              bgcolor="white"
              p={4}
              borderRadius={2}
              boxShadow={3}
            >
              <LoginForm />
            </Box>
          </Box>
        </Box>
      </AuthProvider>
    </>
  );
}

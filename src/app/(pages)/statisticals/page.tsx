"use client";
import React from "react";
import HomePage from "./components/statisticalPage";
import { AuthProvider } from "@/app/core/hooks/AuthContext";

const LoginPage: React.FC = () => {
  return (
    <AuthProvider>
      <>
        <HomePage />
      </>
    </AuthProvider>
  );
};

export default LoginPage;

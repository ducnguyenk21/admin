"use client";
import React from "react";
import HomePage from "./components/UserPage";
//import { AppProvider } from "@/app/core/hooks/AppContext";
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

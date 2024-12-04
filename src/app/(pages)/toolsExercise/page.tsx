"use client";
import React from "react";
import HomePage from "./components/toolsExercisePage";
import { AuthProvider } from "@/app/core/hooks/AuthContext";

const ToolsPage: React.FC = () => {
  return (
    <AuthProvider>
      <>
        <HomePage />
      </>
    </AuthProvider>
  );
};

export default ToolsPage;

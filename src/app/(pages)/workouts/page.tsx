"use client";
import React from "react";
import HomePage from "./components/workoutsPage";
import { AuthProvider } from "@/app/core/hooks/AuthContext";

const WorkoutPage: React.FC = () => {
  return (
    <AuthProvider>
      <>
        <HomePage />
      </>
    </AuthProvider>
  );
};

export default WorkoutPage;

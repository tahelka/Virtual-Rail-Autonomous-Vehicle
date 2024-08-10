/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { auth, login, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

/* eslint-disable no-unused-vars */
import React from "react";
import { useAuth } from "../context/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = login("admin", "admin");

    if (response) navigate("/app");
    else alert("Invalid credentials");
  };

  return (
    <div>
      <button onClick={handleLogin}>Login (admin,admin)</button>
    </div>
  );
}

export default Login;

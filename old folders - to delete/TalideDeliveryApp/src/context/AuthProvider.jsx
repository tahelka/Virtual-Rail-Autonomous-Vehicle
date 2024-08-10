/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useState, useContext } from "react";
import { Navigate } from "react-router-dom";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
  });

  const login = (username, password) => {
    console.log(username, password);

    if (username === "admin" && password === "admin") {
      setAuth(() => {
        return {
          isAuthenticated: true,
          user: {
            username: "admin",
          },
        };
      });
      return true;
    } else {
      setAuth(() => {
        return {
          isAuthenticated: false,
          user: null,
        };
      });
      return false;
    }
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
    });
  };

  const isAuthenticated = () => {
    return auth.isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import General from "./pages/General";
import Admin from "./pages/Admin";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./pages/Login";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  const [maps, setMaps] = useState([]);

  const fetchMaps = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/maps');
      const sortedMaps = response.data.sort((a, b) => new Date(a.creation_time) - new Date(b.creation_time));
      setMaps(sortedMaps);
    } catch (error) {
      console.error('Error fetching maps:', error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/homepage" />} />
              <Route path="login" element={<Login />} />
              <Route path="homepage" element={<h1>homepage</h1>} />
              <Route
                path="app"
                element={
                  <ProtectedRoute>
                    <AppLayout maps={maps} fetchMaps={fetchMaps} />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate replace to="general" />} />
                <Route path="general" element={<General />} />
                <Route path="cars" element={<h1>Cars</h1>} />
                <Route path="data" element={<h1>Data</h1>} />
                <Route path="contacts" element={<h1>Contacts</h1>} />
                <Route path="admin" element={<Admin maps={maps} fetchMaps={fetchMaps} />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;
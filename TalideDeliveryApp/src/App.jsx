/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app" />} />
          <Route path="login" element={<h1>login</h1>} />
          <Route path="app" element={<AppLayout />}>
            <Route path="profile" element={<h1>Profile</h1>} />
            <Route path="cars" element={<h1>Cars</h1>} />
            <Route path="data" element={<h1>Data</h1>} />
            <Route path="contacts" element={<h1>Contacts</h1>} />
            <Route path="admin" element={<h1>admin</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

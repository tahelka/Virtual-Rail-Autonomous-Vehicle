/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="profile" element={<h1>Profile</h1>}></Route>
            <Route path="cars" element={<h1>Cars</h1>}></Route>
            <Route path="data" element={<h1>Data</h1>}></Route>
            <Route path="contacts" element={<h1>Contacts</h1>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

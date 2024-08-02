import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ControlPanel from "./pages/ControlPanel/ControlPanel.jsx";
import ManageMaps from "./pages/ManageMaps/ManageMaps.jsx";
import Statistics from "./pages/Statistics/Statistics.jsx";
import Settings from "./pages/Settings/Settings.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/control-panel" element={<ControlPanel />} />
          <Route path="/manage-maps" element={<ManageMaps />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

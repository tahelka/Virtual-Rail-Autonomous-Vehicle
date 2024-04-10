/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import General from "./components/General";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" />} />
            <Route path="login" element={<h1>login</h1>} />
            <Route path="homepage" element={<h1>homepage</h1>} />
            <Route path="app" element={<AppLayout />}>
              <Route index element={<Navigate replace to="general" />} />
              <Route path="general" element={<General />} />
              <Route path="cars" element={<h1>Cars</h1>} />
              <Route path="data" element={<h1>Data</h1>} />
              <Route path="contacts" element={<h1>Contacts</h1>} />
              <Route path="admin" element={<h1>admin</h1>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import CertificationsList from "./pages/CertificationsList";
import CertificationDetail from "./pages/CertificationsDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/certifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <CertificationsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/certifications/:certCode"
            element={
              <ProtectedRoute>
                <Layout>
                  <CertificationDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

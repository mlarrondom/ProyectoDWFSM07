import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Catalog from "./pages/Catalog.jsx";

import CertificationsAdmin from "./pages/CertificationsList.jsx";
import CertificationsDetail from "./pages/CertificationsDetail.jsx";
import CoursesList from "./pages/CoursesList.jsx";

// Placeholder simple para no romper el link del navbar
function Help() {
  return (
    <div className="container py-4">
      <div className="ds-card help-card">
        <h2 className="help-title">Ayuda</h2>
        <p className="help-text">Próximamente: formulario de contacto.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Público (con navbar) */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />

          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />

          <Route
            path="/catalog"
            element={
              <Layout>
                <Catalog />
              </Layout>
            }
          />

          {/* Admin (privado, con navbar) */}
          <Route
            path="/admin/certifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <CertificationsAdmin />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/certifications/:certCode"
            element={
              <ProtectedRoute>
                <Layout>
                  <CertificationsDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute>
                <Layout>
                  <CoursesList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/help"
            element={
              <Layout>
                <Help />
              </Layout>
            }
          />

          {/* Alias por compatibilidad */}
          <Route path="/certifications" element={<Navigate to="/catalog" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


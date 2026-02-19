import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Catalog from "./pages/Catalog.jsx";
import Help from "./pages/Help.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentFailure from "./pages/PaymentFailure.jsx";
import PaymentPending from "./pages/PaymentPending.jsx";


import CertificationsAdmin from "./pages/CertificationsList.jsx";
import CertificationsDetail from "./pages/CertificationsDetail.jsx";
import CoursesList from "./pages/CoursesList.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Público (con navbar + footer) */}
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

            <Route
              path="/cart"
              element={
                <Layout>
                  <CartPage />
                </Layout>
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

            {/* Admin (privado) */}
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
  path="/checkout"
  element={
    <Layout>
      <CheckoutPage />
    </Layout>
  }
/>

<Route
  path="/payment/success"
  element={
    <Layout>
      <PaymentSuccess />
    </Layout>
  }
/>

<Route
  path="/payment/failure"
  element={
    <Layout>
      <PaymentFailure />
    </Layout>
  }
/>

<Route
  path="/payment/pending"
  element={
    <Layout>
      <PaymentPending />
    </Layout>
  }
/>


            {/* Alias por compatibilidad */}
            <Route path="/certifications" element={<Navigate to="/catalog" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ClientAuthProvider } from "./context/ClientAuthContext";
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

import ClientLogin from "./pages/Login.jsx";
import ClientSignup from "./pages/Signup.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import ClientProtectedRoute from "./components/ClientProtectedRoute.jsx";

function App() {
    return (
        <AuthProvider>
            <ClientAuthProvider>
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

                            {/* Admin login (se mantiene) */}
                            <Route
                                path="/login"
                                element={
                                    <Layout>
                                        <Login />
                                    </Layout>
                                }
                            />

                            {/* Cliente auth */}
                            <Route
                                path="/client/login"
                                element={
                                    <Layout>
                                        <ClientLogin />
                                    </Layout>
                                }
                            />

                            <Route
                                path="/signup"
                                element={
                                    <Layout>
                                        <ClientSignup />
                                    </Layout>
                                }
                            />

                            <Route
                                path="/me"
                                element={
                                    <ClientProtectedRoute>
                                        <Layout>
                                            <MyProfile />
                                        </Layout>
                                    </ClientProtectedRoute>
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

                            {/* ✅ Checkout SOLO LOGUEADOS */}
                            <Route
                                path="/checkout"
                                element={
                                    <ClientProtectedRoute>
                                        <Layout>
                                            <CheckoutPage />
                                        </Layout>
                                    </ClientProtectedRoute>
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
            </ClientAuthProvider>
        </AuthProvider>
    );
}

export default App;
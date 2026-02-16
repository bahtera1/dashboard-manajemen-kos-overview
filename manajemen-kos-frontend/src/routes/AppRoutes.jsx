import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import FullScreenLoader from "../components/common/ui/FullScreenLoader";

const LoadingFallback = () => <FullScreenLoader message="Memuat halaman..." />;

// Auth & Dashboard
const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const DashboardPage = React.lazy(
  () => import("../pages/dashboard/DashboardPage"),
);
const ExportPage = React.lazy(() => import("../pages/export/ExportPage"));

// Kamar
const KamarPage = React.lazy(() => import("../pages/kamar/KamarPage"));
const KamarCreatePage = React.lazy(
  () => import("../pages/kamar/KamarCreatePage"),
);
const KamarEditPage = React.lazy(() => import("../pages/kamar/KamarEditPage"));

// Penghuni
const PenghuniPage = React.lazy(() => import("../pages/penghuni/PenghuniPage"));
const PenghuniCreatePage = React.lazy(
  () => import("../pages/penghuni/PenghuniCreatePage"),
);
const PenghuniEditPage = React.lazy(
  () => import("../pages/penghuni/PenghuniEditPage"),
);
const PenghuniDetailPage = React.lazy(
  () => import("../pages/penghuni/PenghuniDetailPage"),
);

// Transaksi
const TransaksiPage = React.lazy(
  () => import("../pages/transaksi/TransaksiPage"),
);
const TransaksiCreatePage = React.lazy(
  () => import("../pages/transaksi/TransaksiCreatePage"),
);
const TransaksiEditPage = React.lazy(
  () => import("../pages/transaksi/TransaksiEditPage"),
);

/**
 * Komponen proteksi route - redirect ke login jika tidak ada token
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />

          {/* Kamar Routes */}
          <Route path="/kamar" element={<KamarPage />} />
          <Route path="/kamar/create" element={<KamarCreatePage />} />
          <Route path="/kamar/edit/:id" element={<KamarEditPage />} />

          {/* Penghuni Routes */}
          <Route path="/penghuni" element={<PenghuniPage />} />
          <Route path="/penghuni/create" element={<PenghuniCreatePage />} />
          <Route path="/penghuni/edit/:id" element={<PenghuniEditPage />} />
          <Route path="/penghuni/detail/:id" element={<PenghuniDetailPage />} />

          {/* Transaksi Routes */}
          <Route path="/transaksi" element={<TransaksiPage />} />
          <Route path="/transaksi/create" element={<TransaksiCreatePage />} />
          <Route path="/transaksi/edit/:id" element={<TransaksiEditPage />} />

          {/* Export Route */}
          <Route path="/export" element={<ExportPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

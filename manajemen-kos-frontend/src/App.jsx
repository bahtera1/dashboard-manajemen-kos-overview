import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";

// Components
import {
  ToastProvider,
  useToast as useToastHook,
} from "./context/ToastContext";
import apiClient from "./api/apiClient";

/**
 * Komponen untuk mengecek session token secara periodik
 */
const SessionManager = () => {
  const navigate = useNavigate();
  const { showToast } = useToastHook();

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("authToken");
      const expiresAt = localStorage.getItem("tokenExpiresAt");

      if (!token || !expiresAt) {
        return;
      }

      if (Date.now() > parseInt(expiresAt) * 1000) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("user");
        showToast("Sesi Anda telah berakhir. Silakan login kembali.", "error");
        navigate("/login", { replace: true });
      }
    };

    const intervalId = setInterval(checkSession, 600000);

    checkSession();

    return () => clearInterval(intervalId);
  }, [showToast, navigate]);

  return null;
};

/**
 * Setup interceptor untuk handle 401 Unauthorized
 */
const setupAxiosInterceptor = (showToast, navigate) => {
  const interceptor = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiresAt");
        localStorage.removeItem("user");

        showToast("Sesi Anda telah berakhir. Silakan login kembali.", "error");

        if (navigate) {
          navigate("/login", { replace: true });
        } else {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );

  return () => {
    apiClient.interceptors.response.eject(interceptor);
  };
};

/**
 * Wrapper komponen untuk setup Axios interceptor dengan hooks
 */
const AxiosInterceptorSetup = () => {
  const navigate = useNavigate();
  const { showToast } = useToastHook();

  useEffect(() => {
    const cleanup = setupAxiosInterceptor(showToast, navigate);
    return cleanup;
  }, [showToast, navigate]);

  return null;
};

function App() {
  return (
    <GlobalErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <AxiosInterceptorSetup />
          <SessionManager />

          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </GlobalErrorBoundary>
  );
}

export default App;

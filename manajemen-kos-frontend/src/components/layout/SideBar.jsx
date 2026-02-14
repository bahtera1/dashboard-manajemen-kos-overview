import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConfirmModal from "../common/modals/ConfirmModal";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
    setIsLogoutConfirmOpen(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutConfirmOpen(false);
  };

  const getLinkClass = (path) => {
    const isActive =
      location.pathname === path || location.pathname.startsWith(path + "/");
    return `flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const NavLinks = () => (
    <>
      <Link to="/" className={getLinkClass("/")} onClick={handleLinkClick}>
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="whitespace-nowrap">Dashboard</span>
      </Link>

      <Link
        to="/kamar"
        className={getLinkClass("/kamar")}
        onClick={handleLinkClick}
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span className="whitespace-nowrap">Manage Kamar</span>
      </Link>

      <Link
        to="/penghuni"
        className={getLinkClass("/penghuni")}
        onClick={handleLinkClick}
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="whitespace-nowrap">Manage Penghuni</span>
      </Link>

      <Link
        to="/transaksi"
        className={getLinkClass("/transaksi")}
        onClick={handleLinkClick}
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="whitespace-nowrap">Transaksi</span>
      </Link>

      <Link
        to="/export"
        className={getLinkClass("/export")}
        onClick={handleLinkClick}
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span className="whitespace-nowrap">Export Data</span>
      </Link>
    </>
  );

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
                fixed top-0 left-0 h-screen bg-linear-to-b from-gray-900 to-gray-800 text-white z-50
                transition-transform duration-300 ease-in-out shadow-2xl print:hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
                w-64 flex flex-col
                font-[Open_Sans]
            `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 bg-gray-900 shadow-lg px-4  ">
          <h1 className="text-xl font-bold tracking-wide bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent ">
            HANDANI KOST
          </h1>
          <button
            onClick={onClose}
            className="xl:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto ">
          <NavLinks />
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-gray-700 bg-gray-900">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full py-3 px-4 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-all group"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <ConfirmModal
          title="Konfirmasi Logout"
          onCancel={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          message="Apakah Anda yakin ingin keluar dari aplikasi?"
          confirmText="Ya, Logout"
          cancelText="Batal"
        />
      )}
    </>
  );
};

export default Sidebar;

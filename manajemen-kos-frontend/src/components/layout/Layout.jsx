import { useState } from "react";
import Sidebar from "./SideBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 relative">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content Wrapper - Bergeser saat sidebar terbuka di mobile */}
      <div
        className={`
                flex-1 flex flex-col overflow-hidden transition-all duration-300 relative z-20 bg-white
                xl:ml-64
                ${isSidebarOpen ? "ml-64" : "ml-0"}
            `}
      >
        {/* Top Navigation Bar - Mobile & Tablet */}
        <header className="xl:hidden sticky top-0 z-30 flex items-center justify-between bg-white shadow-md px-4 py-3 border-b border-gray-200 print:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800 tracking-wide">
            Manajemen Kost
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-300 pointer-events-none print:hidden"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;

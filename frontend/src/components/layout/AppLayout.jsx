import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { LayoutProvider, useLayout } from "../../context/LayoutContext.jsx";

function AppLayoutInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSidebarHidden } = useLayout();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-dvh bg-transparent">
      {/* Sidebar */}
      {!isSidebarHidden && (
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content Area */}
      <div className={`min-h-dvh min-w-0 ${isSidebarHidden ? "" : "md:ml-[17rem]"}`}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isSidebarHidden={isSidebarHidden} />

        {/* Page Content - This is where nested routes render */}
        <main className="min-h-dvh pt-16">
          <div className="px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <LayoutProvider>
      <AppLayoutInner />
    </LayoutProvider>
  );
}

export default AppLayout;

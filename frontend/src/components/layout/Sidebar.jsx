import React, { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  User,
  LogOut,
  X,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/Authcontext.jsx";
import learnforgeLogo from "../../assets/learnforge-logo.svg";

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { logout } = useAuth();
  const sidebarRef = useRef(null);
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleOutsideClick = (event) => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) return;

      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isSidebarOpen, toggleSidebar]);

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-dvh bg-white/95 backdrop-blur border-r border-gray-200/80
          w-[17rem] z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-200/80">
            <Link
              to="/dashboard"
              onClick={() => {
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              className="flex items-center gap-3 pr-12 min-w-0"
            >
              <img
                src={learnforgeLogo}
                alt="learnforge logo"
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <span className="font-bold text-gray-900 text-lg whitespace-nowrap truncate">
                learnforge
              </span>
            </Link>
            {isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="md:hidden absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => {
                        // Close sidebar on mobile when clicking a link
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {() => (
                        <>
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer - Logout Button */}
          <div className="px-3 py-4 border-t border-gray-200/80">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

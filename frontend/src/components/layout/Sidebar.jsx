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
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-dvh w-[17rem] border-r border-white/70 bg-white/85 backdrop-blur-xl
          z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="relative flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
            <Link
              to="/dashboard"
              onClick={() => {
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              className="flex min-w-0 items-center gap-3 pr-12"
            >
              <img
                src={learnforgeLogo}
                alt="LearnForge logo"
                className="h-10 w-10 rounded-xl shadow-lg"
              />
              <span className="truncate whitespace-nowrap text-lg font-bold text-slate-900">
                LearnForge
              </span>
            </Link>
            {isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </div>

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
                        `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-slate-600 hover:bg-emerald-50 hover:text-slate-900'
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

          <div className="border-t border-slate-200/70 px-3 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
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

import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, User, X, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/Authcontext.jsx";
import { useLocation, useNavigate } from "react-router-dom";

function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const userInitial = (user?.username || user?.email || "U").charAt(0).toUpperCase();
  const pageTitleByPath = {
    "/dashboard": "Dashboard",
    "/documents": "Documents",
    "/flashcards": "Flashcards",
    "/profile": "Profile",
  };
  const pageTitle =
    pageTitleByPath[location.pathname] ||
    (location.pathname.startsWith("/documents/") ? "Document Detail" : "Workspace");

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[17rem] z-40 h-16 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-3 sm:px-5 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 sm:text-base">{pageTitle}</p>
            <p className="hidden text-xs text-slate-500 sm:block">
              {user?.username ? `Welcome back, ${user.username}` : "Stay consistent today"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate("/dashboard#recent-activity")}
            className="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Recent activity"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
          </button>

          <div
            className="relative flex items-center gap-2 border-l border-slate-200 pl-2 sm:gap-3 md:pl-4"
            ref={profileRef}
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">
                {user?.username || "User"}
              </span>
              <span className="max-w-[220px] truncate text-xs text-slate-500">
                {user?.email || "No email"}
              </span>
            </div>

            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md transition hover:shadow-lg"
              aria-label="Open profile menu"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 font-bold text-white">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user?.username || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="rounded-lg p-1.5 transition hover:bg-white/80"
                    aria-label="Close profile menu"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

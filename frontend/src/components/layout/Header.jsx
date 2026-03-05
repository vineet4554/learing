import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, User, X, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/Authcontext.jsx";
import { useNavigate } from "react-router-dom";

function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const userInitial = (user?.username || user?.email || "U").charAt(0).toUpperCase();

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
    <header className="fixed top-0 left-0 right-0 md:left-[17rem] z-40 h-16 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-3 sm:px-5 md:px-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notification */}
          <button
            onClick={() => navigate("/dashboard#recent-activity")}
            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile */}
          <div
            className="relative flex items-center gap-2 pl-2 sm:gap-3 md:pl-4 border-l border-gray-200"
            ref={profileRef}
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900">
                {user?.username || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email || 'No email'}
              </span>
            </div>

            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              aria-label="Open profile menu"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl p-0 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/80"
                    aria-label="Close profile menu"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-gray-700 font-medium hover:bg-red-50 hover:text-red-700 flex items-center gap-3"
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

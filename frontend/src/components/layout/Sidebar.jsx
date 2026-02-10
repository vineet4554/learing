import React from 'react';
import { LayoutDashboard, FileText, BookOpen, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const { logout } = useAuth();
  
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

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 
          w-64 z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">AL</span>
              </div>
              <span className="font-bold text-gray-900 text-lg whitespace-nowrap">AI Learning Assistant</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => {
                        // Close sidebar on mobile when clicking a link
                        if (window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
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
          <div className="px-4 py-4 border-t border-gray-200">
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
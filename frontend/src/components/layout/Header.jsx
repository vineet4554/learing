import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

function Header({ toggleSidebar, user }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notification */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900">
                {user?.username || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email || 'No email'}
              </span>
            </div>

            <button className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Page Content - This is where nested routes render */}
        <main className='flex-1 overflow-y-auto bg-gray-50'>
          <div className='p-4 md:p-6 lg:p-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AppLayout from '../layout/AppLayout.jsx'
const ProtectedRoute = () => {
    const isAuthenticated = false; // Replace with actual authentication logic
    const loading = false; // Replace with actual loading state

    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    return isAuthenticated ? (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ) : (
        <Navigate to="/register" /> 

    );
 
  
}

export default ProtectedRoute

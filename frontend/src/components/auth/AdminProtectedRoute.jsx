import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user is authenticated and has SUPER_ADMIN role
  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />
  }

  return children
}

export default AdminProtectedRoute

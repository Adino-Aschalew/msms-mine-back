import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const HRProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has HR role
  const hrRoles = ['HR', 'ADMIN', 'SUPER_ADMIN']
  if (!hrRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default HRProtectedRoute

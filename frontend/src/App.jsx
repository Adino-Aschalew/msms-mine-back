import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/common/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Loans from './pages/Loans'
import Savings from './pages/Savings'
import Payroll from './pages/Payroll'
import Reports from './pages/Reports'
import AI from './pages/AI'
import TestTailwind from './test-tailwind'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HRProtectedRoute from './components/auth/HRProtectedRoute'
import AdminProtectedRoute from './components/auth/AdminProtectedRoute'

// HR Pages
import HRDashboard from './pages/hr/HRDashboard'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import EmployeeVerification from './pages/hr/EmployeeVerification'
import BulkOperations from './pages/hr/BulkOperations'
import EmployeeDetails from './pages/hr/EmployeeDetails'
import DepartmentOverview from './pages/hr/DepartmentOverview'
import JobGrades from './pages/hr/JobGrades'
import EmployeeStats from './pages/hr/EmployeeStats'
import HRProfile from './pages/hr/HRProfile'
import HRSettings from './pages/hr/HRSettings'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import HRAdminManagement from './pages/admin/HRAdminManagement'
import CreateHRAdmin from './pages/admin/CreateHRAdmin'
import LoanCommitteeAdminManagement from './pages/admin/LoanCommitteeAdminManagement'
import CreateLoanCommitteeAdmin from './pages/admin/CreateLoanCommitteeAdmin'
import AdminProfile from './pages/admin/AdminProfile'
import AdminSettings from './pages/admin/AdminSettings'
import AdminSecurity from './pages/admin/AdminSecurity'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<TestTailwind />} />
          
          {/* Admin Routes - Outside regular Layout */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/hr-admins" element={
            <AdminProtectedRoute>
              <HRAdminManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/hr-admins/create" element={
            <AdminProtectedRoute>
              <CreateHRAdmin />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/loan-committee-admins" element={
            <AdminProtectedRoute>
              <LoanCommitteeAdminManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/loan-committee-admins/create" element={
            <AdminProtectedRoute>
              <CreateLoanCommitteeAdmin />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <AdminProtectedRoute>
              <AdminProfile />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminProtectedRoute>
              <AdminSettings />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/security" element={
            <AdminProtectedRoute>
              <AdminSecurity />
            </AdminProtectedRoute>
          } />
          
          {/* HR Routes - Outside regular Layout (no duplicate inside Layout) */}
          <Route path="/hr" element={
            <HRProtectedRoute>
              <HRDashboard />
            </HRProtectedRoute>
          } />
          <Route path="/hr/employees" element={
            <HRProtectedRoute>
              <EmployeeManagement />
            </HRProtectedRoute>
          } />
          <Route path="/hr/verification" element={
            <HRProtectedRoute>
              <EmployeeVerification />
            </HRProtectedRoute>
          } />
          <Route path="/hr/bulk-operations" element={
            <HRProtectedRoute>
              <BulkOperations />
            </HRProtectedRoute>
          } />
          <Route path="/hr/employees/:userId" element={
            <HRProtectedRoute>
              <EmployeeDetails />
            </HRProtectedRoute>
          } />
          <Route path="/hr/departments" element={
            <HRProtectedRoute>
              <DepartmentOverview />
            </HRProtectedRoute>
          } />
          <Route path="/hr/job-grades" element={
            <HRProtectedRoute>
              <JobGrades />
            </HRProtectedRoute>
          } />
          <Route path="/hr/stats" element={
            <HRProtectedRoute>
              <EmployeeStats />
            </HRProtectedRoute>
          } />
          <Route path="/hr/profile" element={
            <HRProtectedRoute>
              <HRProfile />
            </HRProtectedRoute>
          } />
          <Route path="/hr/settings" element={
            <HRProtectedRoute>
              <HRSettings />
            </HRProtectedRoute>
          } />
          
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/loans" element={
                  <ProtectedRoute>
                    <Loans />
                  </ProtectedRoute>
                } />
                <Route path="/savings" element={
                  <ProtectedRoute>
                    <Savings />
                  </ProtectedRoute>
                } />
                <Route path="/payroll" element={
                  <ProtectedRoute>
                    <Payroll />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/ai" element={
                  <ProtectedRoute>
                    <AI />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

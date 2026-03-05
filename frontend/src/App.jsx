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

// HR Pages
import HRDashboard from './pages/hr/HRDashboard'
import EmployeeManagement from './pages/hr/EmployeeManagement'
import EmployeeVerification from './pages/hr/EmployeeVerification'
import BulkOperations from './pages/hr/BulkOperations'
import EmployeeDetails from './pages/hr/EmployeeDetails'
import DepartmentOverview from './pages/hr/DepartmentOverview'
import JobGrades from './pages/hr/JobGrades'
import EmployeeStats from './pages/hr/EmployeeStats'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<TestTailwind />} />
          
          {/* HR Routes - Outside regular Layout */}
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
                {/* HR Routes */}
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
              </Routes>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

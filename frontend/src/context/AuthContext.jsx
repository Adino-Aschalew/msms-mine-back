import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: null, token } })
    }
  }, [])

  const login = async (employee_id, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await api.post('/auth/login', { employee_id, password })
      const { data } = response
      
      if (data.success) {
        const { token, user } = data.data
        console.log('Login success - user data:', user)
        localStorage.setItem('token', token)
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
        console.log('Login success - state dispatched')
        return { success: true, user }
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.message || 'Login failed' })
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const getDashboardRoute = () => {
    const { user } = state
    if (!user) return '/login'
    
    // HR roles get HR dashboard
    const hrRoles = ['HR', 'ADMIN', 'SUPER_ADMIN']
    if (hrRoles.includes(user.role)) {
      return '/hr'
    }
    
    // Other roles get regular dashboard
    return '/dashboard'
  }

  const isHR = () => {
    const { user } = state
    if (!user) return false
    const hrRoles = ['HR', 'ADMIN', 'SUPER_ADMIN']
    return hrRoles.includes(user.role)
  }

  const value = {
    ...state,
    login,
    logout,
    getDashboardRoute,
    isHR
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (check sessionStorage)
    const savedUser = sessionStorage.getItem('trainAppUser')
    const savedToken = sessionStorage.getItem('trainAppToken')
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setAuthToken(savedToken)
        setIsAuthenticated(true)
      } catch (error) {
        sessionStorage.removeItem('trainAppUser')
        sessionStorage.removeItem('trainAppToken')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      // Call your actual backend API
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.detail || 'Login failed' }
      }

      const tokenData = await response.json()
      
      // Get user details with the token
      const userResponse = await fetch('http://localhost:8000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })

      if (!userResponse.ok) {
        return { success: false, error: 'Failed to get user details' }
      }

      const userData = await userResponse.json()
      
      setUser(userData)
      setAuthToken(tokenData.access_token)
      setIsAuthenticated(true)
      
      // Save to sessionStorage
      sessionStorage.setItem('trainAppUser', JSON.stringify(userData))
      sessionStorage.setItem('trainAppToken', tokenData.access_token)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please check if the backend is running.' }
    }
  }

  const logout = () => {
    setUser(null)
    setAuthToken(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem('trainAppUser')
    sessionStorage.removeItem('trainAppToken')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      authToken,  // Now providing authToken
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}
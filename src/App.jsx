import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser, verifyToken } from './utils/auth'
import SparkleEffect from './components/SparkleEffect'
import ProtectedRoute from './components/ProtectedRoute'
import AgentWorkspace from './pages/AgentWorkspace'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'

export default function App() {
  const [user, setUser] = useState(getCurrentUser())
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const verifiedUser = await verifyToken()
      setUser(verifiedUser)
      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentUser())
    }
    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(() => {
      setUser(getCurrentUser())
    }, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (authLoading) {
    return (
      <div className="gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: '#6366f1',
                borderRightColor: '#a855f7',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-transparent"
              style={{
                borderBottomColor: '#00d4ff',
                borderLeftColor: '#6366f1',
                animation: 'spin 1.2s linear infinite reverse',
              }}
            />
          </div>
          <p className="text-slate-500 text-sm">Loading NexusForge AI...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <SparkleEffect />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15, 15, 35, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#6366f1', secondary: '#e2e8f0' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' },
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Home user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute user={user}>
                <AgentWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

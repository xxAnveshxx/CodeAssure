import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'
import Header from '../components/Header'
import LogoutWarning from '../components/LogoutWarning'
import { Moon, Sun, User, Shield, Info, ExternalLink, LogOut } from 'lucide-react'

function Settings() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false
  })
  const handleLogoutClick = () => {
    setShowLogoutWarning(true)
  }
  const handleLogoutConfirm = () => {
    localStorage.removeItem('auth_token')
    setShowLogoutWarning(false)
    navigate('/login')
  }
  const handleLogoutCancel = () => {
    setShowLogoutWarning(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header user={user} onLogout={handleLogoutClick} />
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
            </div>
            
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-16 h-16 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{user.username}</p>
                    {user.email && <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">GitHub ID: {user.github_id}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition" >
                    View GitHub Profile
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="pt-3">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-white bg-red-50 dark:bg-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition font-medium" >
                      <LogOut className="w-4 h-4" />
                      Logout from CodeAssure
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              {isDark ? (
                <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Sun className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              )}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Switch to Light
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Switch to Dark
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">About CodeAssure</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-white">Version:</strong> 1.0.0
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">AI Model:</strong> Llama 3.3 70B (via Groq)
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Features:</strong> 
                <span className="ml-2">Bug Detection, Security Analysis, Performance Optimization</span>
              </p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Your code reviews are private and only visible to you
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showLogoutWarning && (
        <LogoutWarning 
          user={user}
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </div>
  )
}
export default Settings
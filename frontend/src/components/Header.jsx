import React from 'react'
import { Shield, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { NavLink } from 'react-router-dom'

function Header({ user, onLogout }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CodeAssure</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Code Review Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            {user && (
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">{user.username}</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex gap-1 -mb-px">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/repositories"
            className={({ isActive }) =>
              `px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`
            }
          >
            Repositories
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`
            }
          >
            Settings
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
export default Header
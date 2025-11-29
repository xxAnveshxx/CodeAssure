import React from 'react'
import { Shield, AlertTriangle, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function Login() {
  const { isDark, toggleTheme } = useTheme()

  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/login'
  }

  const handleDifferentAccount = () => {
    const returnUrl = encodeURIComponent(window.location.href)
    window.location.href = `https://github.com/logout?return_to=${returnUrl}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm font-medium text-sm"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-yellow-500" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-gray-700" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full transition-colors border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-600 dark:bg-indigo-500 p-3 rounded-lg mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CodeAssure</h1>
          <p className="text-gray-600 dark:text-gray-400">AI-Powered Code Review Assistant</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded mb-6 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">Using a shared or public computer?</p>
              <p className="text-blue-800 dark:text-blue-200">
                Click <strong>"Use Different Account"</strong> below to make sure you log in with YOUR GitHub account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition flex items-center justify-center gap-3 font-medium shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={handleDifferentAccount}
            className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Use a Different Account
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By signing in, you agree to let CodeAssure access your GitHub repositories for code review purposes.
          </p>
        </div>

        <div className="mt-4 text-center">
          <details className="text-xs text-gray-600 dark:text-gray-400">
            <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 font-medium">
              Why two buttons?
            </summary>
            <div className="mt-2 text-left bg-gray-50 dark:bg-gray-900 p-3 rounded transition-colors">
              <p className="mb-2 text-gray-700 dark:text-gray-300">
                <strong>"Continue with GitHub"</strong> - Quick login (recommended for personal devices)
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>"Use Different Account"</strong> - Logs you out from GitHub first, then asks you to login again (recommended for shared computers)
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
export default Login
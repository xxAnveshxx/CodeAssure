import React from 'react'
import { AlertTriangle, LogOut, ExternalLink } from 'lucide-react'

function LogoutWarning({ user, onConfirm, onCancel }) {
  const handleGitHubLogout = () => {
    window.open('https://github.com/logout', '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Logging Out</h3>
        </div>

        {user && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4 flex items-center gap-3">
            <img 
              src={user.avatar_url} 
              alt={user.username}
              className="w-10 h-10 rounded-full"/>
            <div>
              <p className="font-semibold text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-600">Will be logged out from CodeAssure</p>
            </div>
          </div>
        )}
        
        <p className="text-gray-700 mb-4">
          You will be logged out of <strong>CodeAssure</strong>, but you may still be logged into GitHub.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 mb-1">On a shared computer?</p>
              <p className="text-yellow-800 mb-2">
                Make sure to also logout from GitHub.com to prevent the next person from accessing your account.
              </p>
              <button
                onClick={handleGitHubLogout}
                className="text-yellow-900 underline hover:no-underline font-medium flex items-center gap-1 text-xs">
                Logout from GitHub.com
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium">
            <LogOut className="w-4 h-4" />
            Logout from CodeAssure
          </button>
        </div>
      </div>
    </div>
  )
}
export default LogoutWarning
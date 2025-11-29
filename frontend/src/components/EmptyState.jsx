import React from 'react'
import { FileSearch, GitPullRequest, Zap, Shield } from 'lucide-react'

function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center transition-colors">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileSearch className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        No Reviews Yet
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Start reviewing your code with AI! Trigger your first review using the form on the right.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
        <div className="text-center">
          <div className="bg-blue-50 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <GitPullRequest className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">1. Enter PR Details</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Repository name and pull request number
          </p>
        </div>

        <div className="text-center">
          <div className="bg-purple-50 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">2. AI Analyzes</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detects bugs, security issues, and performance problems
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-50 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">3. Get Results</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View detailed findings and suggestions
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-w-md mx-auto text-left">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">EXAMPLE:</p>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Repository:</span>
            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-900 dark:text-gray-100">facebook/react</code>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">PR Number:</span>
            <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs text-gray-900 dark:text-gray-100">28339</code>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EmptyState
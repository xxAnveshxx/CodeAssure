import React, { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { triggerManualReview } from '../lib/api'

function ManualReviewForm({ onSuccess }) {
  const [repo, setRepo] = useState('')
  const [prNumber, setPrNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await triggerManualReview(repo, parseInt(prNumber))
      alert(`Review started for ${repo}#${prNumber}\n\nCheck back in a few seconds!`)
      setRepo('')
      setPrNumber('')
      
      if (onSuccess) {
        setTimeout(onSuccess, 3000)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
        Trigger Manual Review
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repository
          </label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="owner/repo-name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example: facebook/react
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            PR Number
          </label>
          <input
            type="number"
            value={prNumber}
            onChange={(e) => setPrNumber(e.target.value)}
            placeholder="123"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium" >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Review
            </>
          )}
        </button>
      </form>
    </div>
  )
}
export default ManualReviewForm
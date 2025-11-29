import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/api'
import Header from '../components/Header'
import { Database, CheckCircle, Clock, AlertCircle, Play, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Repositories() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [repoInput, setRepoInput] = useState('')
  const [embeddedRepos, setEmbeddedRepos] = useState([])

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false
  })

  const embedMutation = useMutation({
    mutationFn: async (repo) => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.post(
        `${API_URL}/api/embeddings/embed-repository`,
        null,
        { params: { repo, token } }
      )
      return data
    },
    onSuccess: (data, repo) => {
      setEmbeddedRepos(prev => [...prev, { repo, status: 'processing' }])
      setTimeout(() => checkEmbeddingStatus(repo), 5000)
    }
  })

  const checkEmbeddingStatus = async (repo) => {
    try {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${API_URL}/api/embeddings/embedding-status`,
        { params: { repo, token } }
      )
      setEmbeddedRepos(prev => 
        prev.map(r => 
          r.repo === repo 
            ? { ...r, status: data.embedded ? 'completed' : 'processing', vectors: data.vectors }
            : r
        )
      )
    } catch (err) {
      console.error('Status check error:', err)
    }
  }

  const handleEmbed = (e) => {
    e.preventDefault()
    if (repoInput.trim()) {
      embedMutation.mutate(repoInput.trim())
      setRepoInput('')
    }
  }

  if (userLoading) {
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
      <Header user={user} onLogout={() => {
        localStorage.removeItem('auth_token')
        navigate('/login')
      }} />
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Repositories</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Embed your repositories for context-aware code reviews
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What is Repository Embedding?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                When you embed a repository, CodeAssure analyzes your entire codebase and learns your coding patterns. 
                Future PR reviews will be <strong>context-aware</strong> and suggest changes that match your existing code style.
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Detects inconsistent patterns</li>
                <li>2. Suggests fixes matching your codebase</li>
                <li>3. Finds similar code across your repo</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Embed a Repository
          </h2>
          
          <form onSubmit={handleEmbed} className="flex gap-3">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="owner/repository-name"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              disabled={embedMutation.isPending}
            />
            <button
              type="submit"
              disabled={embedMutation.isPending || !repoInput.trim()}
              className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {embedMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Embedding...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Embed
                </>
              )}
            </button>
          </form>

          {embedMutation.isError && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              Error: {embedMutation.error.message}
            </div>
          )}
        </div>

        {embeddedRepos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Embedded Repositories
            </h2>
            
            <div className="space-y-3">
              {embeddedRepos.map((repo, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                        {repo.repo}
                      </p>
                      {repo.vectors && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {repo.vectors} code files embedded
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {repo.status === 'processing' ? (
                      <>
                        <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                          Processing...
                        </span>
                      </>
                    ) : repo.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Ready
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                          Failed
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {embeddedRepos.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <Database className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No repositories embedded yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by embedding your first repository above
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Example: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">facebook/react</code>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
export default Repositories
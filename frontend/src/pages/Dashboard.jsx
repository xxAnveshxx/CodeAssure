import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchReviews, getCurrentUser } from '../lib/api'
import Header from '../components/Header'
import StatsCards from '../components/StatsCards'
import ReviewCard from '../components/ReviewCard'
import ReviewDetailModal from '../components/ReviewDetailModal'
import ReviewFilters from '../components/ReviewFilters'
import ManualReviewForm from '../components/ManualReviewForm'
import EmptyState from '../components/EmptyState'
import { RefreshCw, Search } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const [selectedReview, setSelectedReview] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    retry: false
  })
  const { data: reviews, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
    refetchInterval: 5000,
    retry: false
  })

  const filteredReviews = useMemo(() => {
    try {
      if (!reviews || !Array.isArray(reviews)) return []
      let filtered = [...reviews]
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        filtered = filtered.filter(review => {
          try {
            const repoMatch = review.repo_name?.toLowerCase().includes(query) || false
            const prMatch = review.pr_number?.toString().includes(query) || false
            const summaryMatch = review.summary?.toLowerCase().includes(query) || false
            
            return repoMatch || prMatch || summaryMatch
          } catch (err) {
            console.error('Filter error:', err, review)
            return false
          }
        })
      }
      if (severityFilter && severityFilter !== 'all') {
        filtered = filtered.filter(review => {
          try {
            return review.severity === severityFilter
          } catch (err) {
            return false
          }
        })
      }
      return filtered
    } catch (err) {
      console.error('Error in filteredReviews:', err)
      return []
    }
  }, [reviews, searchQuery, severityFilter])

  const handleReviewClick = (review) => {
    setSelectedReview(review)
  }

  const handleCloseModal = () => {
    setSelectedReview(null)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSeverityFilter('all')
  }

  if (userError) {
    console.error('User error:', userError)
    localStorage.removeItem('auth_token')
    navigate('/login')
    return null
  }

  if (error) {
    console.error('Reviews error:', error)
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

  const hasReviews = reviews && reviews.length > 0
  const showFilters = hasReviews

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Header user={user} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <StatsCards reviews={reviews || []} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Reviews</h2>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {showFilters && (
              <ReviewFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                severityFilter={severityFilter}
                onSeverityChange={setSeverityFilter}
                onClearFilters={handleClearFilters}
                totalCount={reviews.length}
                filteredCount={filteredReviews.length}
              />
            )}

            {error ? (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 p-6 rounded-lg">
                <p className="text-red-800 dark:text-red-200">Error loading reviews. Please try again.</p>
                <button 
                  onClick={() => refetch()}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading reviews...</p>
              </div>
            ) : !hasReviews ? (
              <EmptyState />
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No reviews found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map(review => (
                  <ReviewCard 
                    key={review.id} 
                    review={review}
                    onClick={() => handleReviewClick(review)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <ManualReviewForm onSuccess={refetch} />
            {user && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Logged in as
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                    {user.email && <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>}
                  </div>
                </div>
                <a
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition border border-gray-300 dark:border-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  View GitHub Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Dashboard
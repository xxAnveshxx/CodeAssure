import React from 'react'
import { Search, Filter, X } from 'lucide-react'

function ReviewFilters({ 
  searchQuery, 
  onSearchChange, 
  severityFilter, 
  onSeverityChange,
  onClearFilters,
  totalCount,
  filteredCount
}) {
  const severityOptions = [
    { value: 'all', label: 'All Severities', color: 'text-gray-600 dark:text-gray-400' },
    { value: 'high', label: 'High', color: 'text-red-600 dark:text-red-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'low', label: 'Low', color: 'text-green-600 dark:text-green-400' }
  ]

  const hasActiveFilters = searchQuery || severityFilter !== 'all'

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by repository name, PR number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />
        </div>

        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors appearance-none cursor-pointer"
          >
            {severityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> of {totalCount} reviews
        </div>
      )}
    </div>
  )
}

export default ReviewFilters
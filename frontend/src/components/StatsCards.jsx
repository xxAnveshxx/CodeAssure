import React from 'react'
import { FileText, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

function StatsCards({ reviews }) {
  const totalReviews = reviews?.length || 0
  const highSeverity = reviews?.filter(r => r.severity === 'high').length || 0
  const noIssues = reviews?.filter(r => !r.issues || r.issues.length === 0).length || 0
  const totalIssues = reviews?.reduce((sum, r) => sum + (r.issues?.length || 0), 0) || 0

  const stats = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      icon: FileText,
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Critical Issues',
      value: highSeverity,
      icon: AlertTriangle,
      color: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    },
    {
      label: 'Clean PRs',
      value: noIssues,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
    },
    {
      label: 'Issues Found',
      value: totalIssues,
      icon: TrendingUp,
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg transition-colors`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
import React from 'react'
import { ExternalLink, AlertCircle, CheckCircle, XCircle, AlertTriangle, Bug, Lock, Zap, Code, ChevronRight } from 'lucide-react'

function ReviewCard({ review, onClick }) {
  const severityConfig = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
      icon: XCircle
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
      icon: AlertTriangle
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
      icon: CheckCircle
    }
  }
  const config = severityConfig[review.severity] || severityConfig.low
  const SeverityIcon = config.icon
  const typeIcons = {
    bug: Bug,
    security: Lock,
    performance: Zap,
    style: Code
  }
  return (
    <div 
      onClick={onClick}
      className={`${config.bg} border-l-4 ${config.border} p-6 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer group`} 
      >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900">
              {review.repo_name}
            </h3>
            <span className="text-gray-500 text-sm">#{review.pr_number}</span>
          </div>
          <p className="text-gray-700 text-sm">{review.summary}</p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <SeverityIcon className={`w-5 h-5 ${config.text}`} />
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
            {review.severity.toUpperCase()}
          </span>
        </div>
      </div>

      {review.issues && review.issues.length > 0 ? (
        <div className="space-y-2 mb-4">
          <p className="text-sm font-semibold text-gray-700">
            Issues Found: {review.issues.length}
          </p>
          
          {review.issues.slice(0, 2).map((issue, idx) => {
            const IssueIcon = typeIcons[issue.type] || AlertCircle
            
            return (
              <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-start gap-2">
                  <IssueIcon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-900 uppercase">
                        {issue.type}
                      </span>
                      <span className="text-xs text-gray-500 font-mono truncate">
                        {issue.file}
                        {issue.line && `:${issue.line}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{issue.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
          
          {review.issues.length > 2 && (
            <p className="text-xs text-gray-500 text-center">
              + {review.issues.length - 2} more issues
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded border border-gray-200 mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">No issues found - Code looks good </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          {new Date(review.created_at).toLocaleString()}
        </span>
        <div className="flex items-center gap-3">
          <a 
            href={review.pr_url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-1 text-sm text-gray-600 group-hover:text-indigo-600 transition">
            View Details
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
export default ReviewCard
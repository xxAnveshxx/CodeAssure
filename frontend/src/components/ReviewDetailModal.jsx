import React from 'react'
import { X, ExternalLink, AlertCircle, CheckCircle, XCircle, AlertTriangle, Bug, Lock, Zap, Code, Copy, Check } from 'lucide-react'

function ReviewDetailModal({ review, onClose }) {
  const [copiedIndex, setCopiedIndex] = React.useState(null)

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

  const typeIcons = {
    bug: { icon: Bug, color: 'text-red-600', bg: 'bg-red-50' },
    security: { icon: Lock, color: 'text-orange-600', bg: 'bg-orange-50' },
    performance: { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    style: { icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' }
  }

  const config = severityConfig[review.severity] || severityConfig.low
  const SeverityIcon = config.icon

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8">
        <div className={`${config.bg} border-b ${config.border} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <SeverityIcon className={`w-6 h-6 ${config.text}`} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Code Review Details
                </h2>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-700 font-mono">
                  {review.repo_name}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-700">
                  PR #{review.pr_number}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                  {review.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {review.summary}
            </p>
          </div>

          {review.issues && review.issues.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Issues Found ({review.issues.length})
              </h3>
              
              <div className="space-y-4">
                {review.issues.map((issue, idx) => {
                  const typeConfig = typeIcons[issue.type] || typeIcons.bug
                  const IssueIcon = typeConfig.icon

                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className={`${typeConfig.bg} p-4 border-b border-gray-200`}>
                        <div className="flex items-start gap-3">
                          <IssueIcon className={`w-5 h-5 ${typeConfig.color} flex-shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs font-bold uppercase ${typeConfig.color}`}>
                                {issue.type}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">
                                {issue.file}
                                {issue.line && `:${issue.line}`}
                              </span>
                            </div>
                            {issue.title && (
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {issue.title}
                              </h4>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">

                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Problem:</p>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                        </div>

                        {issue.suggestion && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Suggestion:</p>
                            <p className="text-sm text-gray-600">{issue.suggestion}</p>
                          </div>
                        )}

                        {issue.code_example && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-700">
                                {typeof issue.code_example === 'object' ? 'Code Comparison:' : 'Fixed Code:'}
                              </p>
                              <button
                                onClick={() => handleCopy(
                                  typeof issue.code_example === 'object' 
                                    ? JSON.stringify(issue.code_example, null, 2)
                                    : issue.code_example, 
                                  idx
                                )}
                                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            
                            {typeof issue.code_example === 'object' && issue.code_example.before && issue.code_example.after ? (
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-red-600 font-semibold mb-1">Before:</p>
                                  <pre className="bg-red-50 border border-red-200 text-gray-900 p-3 rounded text-xs overflow-x-auto">
                                    <code>{issue.code_example.before}</code>
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs text-green-600 font-semibold mb-1">After:</p>
                                  <pre className="bg-green-50 border border-green-200 text-gray-900 p-3 rounded text-xs overflow-x-auto">
                                    <code>{issue.code_example.after}</code>
                                  </pre>
                                </div>
                              </div>
                            ) : (
                              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                                <code>
                                  {typeof issue.code_example === 'object' 
                                    ? JSON.stringify(issue.code_example, null, 2)
                                    : issue.code_example
                                  }
                                </code>
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-green-900 mb-1">No Issues Found!</h4>
              <p className="text-sm text-green-700">The code looks clean and follows best practices.</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Reviewed on {new Date(review.created_at).toLocaleString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
            >
              Close
            </button>
            <a
              href={review.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
            >
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewDetailModal
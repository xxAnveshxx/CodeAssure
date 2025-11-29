import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('auth_token', token)
      navigate('/')
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Logging you in...</p>
      </div>
    </div>
  )
}
export default AuthCallback
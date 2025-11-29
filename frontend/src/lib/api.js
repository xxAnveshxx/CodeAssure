import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.params = {
      ...config.params,
      token: token
    }
  }
  return config
})

export const fetchReviews = async () => {
  try {
    const { data } = await api.get('/api/reviews/')
    return data.reviews || []
  } catch (error) {
    console.error('Fetch reviews error:', error)
    throw error
  }
}

export const fetchReview = async (id) => {
  const { data } = await api.get(`/api/reviews/${id}`)
  return data
}

export const triggerManualReview = async (repo, prNumber) => {
  const { data } = await api.post(`/api/test/manual-review`, null, {
    params: { repo, pr_number: prNumber }
  })
  return data
}

export const checkHealth = async () => {
  const { data } = await api.get('/api/test/health')
  return data
}

export const getCurrentUser = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) throw new Error('No token')
  try {
    const { data } = await api.get('/api/auth/me')
    return data
  } catch (error) {
    console.error('Get user error:', error)
    throw error
  }
}
export default api
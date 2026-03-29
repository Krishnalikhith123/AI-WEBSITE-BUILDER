const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/auth'

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data.user
}

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data.user
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const verifyToken = async () => {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      logoutUser()
      return null
    }
    const data = await res.json()
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  } catch {
    logoutUser()
    return null
  }
}

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

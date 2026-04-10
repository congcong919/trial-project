import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()
const API_BASE_URL = import.meta.env.VITE_API_KEY

let accessToken = null

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  // On mount: try to restore session via refresh token cookie.
  useEffect(() => {
    tryRefresh().finally(() => setAuthReady(true))
  }, [])

  const tryRefresh = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) return false
      const data = await res.json()
      accessToken = data.accessToken
      setIsAuthenticated(true)
      return true
    } catch {
      return false
    }
  }

  const signIn = (token) => {
    accessToken = token
    setIsAuthenticated(true)
  }

  const signOut = async () => {
    accessToken = null
    setIsAuthenticated(false)
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  }

  const fetchWithAuth = async (url, options = {}) => {
    const makeRequest = () =>
      fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      })

    let res = await makeRequest()
    if (res.status === 401) {
      const refreshed = await tryRefresh()
      if (!refreshed) {
        signOut()
        return res
      }
      res = await makeRequest()
    }
    return res
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, authReady, signIn, signOut, tryRefresh, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

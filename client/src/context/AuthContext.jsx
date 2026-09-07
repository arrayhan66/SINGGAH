import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const AuthContext = createContext(null)

function loadStoredUser() {
  try {
    const raw = sessionStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function hasStoredSession() {
  return Boolean(sessionStorage.getItem("token") && sessionStorage.getItem("user"))
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(loadStoredUser)
  const [token, setToken] = useState(() => sessionStorage.getItem("token"))
  const [isLoading, setIsLoading] = useState(() => hasStoredSession())

  // Sinkronkan data user dengan server supaya field
  // seperti created_at tidak hilang/stale di sessionStorage.
  useEffect(() => {
    if (!hasStoredSession()) return

    api
      .get("/auth/me")
      .then((res) => {
        const freshUser = res.data?.data
        if (freshUser) {
          setUser(freshUser)
          sessionStorage.setItem("user", JSON.stringify(freshUser))
        }
      })
      .catch((err) => {
        // Token kedaluwarsa/tidak valid -> bersihkan sesi.
        if (err.response?.status === 401) {
          setUser(null)
          setToken(null)
          sessionStorage.removeItem("token")
          sessionStorage.removeItem("user")
        } else {
          console.error("Gagal menyinkronkan data user:", err)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setToken(token)

    sessionStorage.setItem("user", JSON.stringify(userData))
    sessionStorage.setItem("token", token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    localStorage.removeItem("admin-sidebar-collapsed")
    navigate("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}

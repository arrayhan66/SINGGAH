import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Token & user disimpan di cookie HttpOnly sisi server, jadi di sini
  // cukup tanya ke /auth/me untuk tahu siapa yang login saat ini.
  useEffect(() => {
    let cancelled = false

    api
      .get("/auth/me")
      .then((res) => {
        if (cancelled) return
        const freshUser = res.data?.data
        setUser(freshUser || null)
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 401) {
          setUser(null)
        } else {
          console.error("Gagal menyinkronkan data user:", err)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // abaikan — cookie mungkin sudah kedaluwarsa
    }
    setUser(null)
    localStorage.removeItem("admin-sidebar-collapsed")
    navigate("/login")
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api, { setOnUnauthorized } from "../services/api"
import { clearUploadDraft } from "../utils/draftStorage"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 401 selain /auth/me dialihkan lewat router (tanpa reload halaman) supaya
  // form/draft tidak hilang. Arahkan balik ke halaman asal setelah login lagi.
  useEffect(() => {
    setOnUnauthorized((error) => {
      const url = error?.config?.url || ""
      const isLogout = url.includes("/auth/logout")
      if (!isLogout && window.location.pathname !== "/login") {
        setUser(null)
        navigate("/login", {
          replace: true,
          state: { from: window.location.pathname + window.location.search },
        })
      }
    })
    return () => setOnUnauthorized(null)
  }, [navigate])

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
    await clearUploadDraft()
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
import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Waktu app pertama kali dibuka, cek localStorage
  // biar user tetap login walau refresh halaman.
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

    setIsLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setToken(token)

    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("token", token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function GuestRoute({ children }) {
  const { user, token, isLoading } = useAuth()

  if (isLoading) return null

  if (token && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

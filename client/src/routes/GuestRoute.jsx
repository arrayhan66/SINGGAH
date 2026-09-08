import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function GuestRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

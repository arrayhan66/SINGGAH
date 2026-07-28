import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function ProtectedRoute({ children, allowedRoles, allowedTypes }) {
  const { user, token, isLoading } = useAuth()
  const location = useLocation()

  // Masih ngecek localStorage, jangan redirect dulu biar gak flicker
  if (isLoading) {
    return null
  }

  // Belum login sama sekali -> lempar ke login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (allowedTypes && !allowedTypes.includes(user.tipe)) {
    return <Navigate to="/" replace />
  }

  return children
}

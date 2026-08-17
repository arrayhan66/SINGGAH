import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function ProtectedRoute({ children, allowedRoles, allowedTypes }) {
  const { user, token, isLoading } = useAuth()

  // Masih ngecek localStorage, jangan redirect dulu biar gak flicker
  if (isLoading) {
    return null
  }

  // Belum login sama sekali -> lempar ke login (tanpa state.from biar tombol Kembali selalu ke "/")
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (allowedTypes && !allowedTypes.includes(user.tipe)) {
    return <Navigate to="/" replace />
  }

  return children
}

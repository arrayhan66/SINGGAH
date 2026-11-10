import { Link, useLocation } from "react-router-dom"
import "../../styles/auth-switch.css"

export default function AuthSwitch({ onNavigate }) {
  const { pathname } = useLocation()
  const isRegister = pathname.startsWith("/register")

  return (
    <div
      role="tablist"
      aria-label="Akun"
      className="auth-toggle"
      data-active={isRegister ? "register" : "login"}
    >
      <Link
        to="/login"
        onClick={onNavigate}
        className="auth-tab auth-login"
        role="tab"
        aria-selected={!isRegister}
      >
        Login
      </Link>

      <Link
        to="/register"
        onClick={onNavigate}
        className="auth-tab"
        role="tab"
        aria-selected={isRegister}
      >
        Register
      </Link>
    </div>
  )
}

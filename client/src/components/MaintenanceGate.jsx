import { useEffect, useState } from "react"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import Maintenance from "../pages/Maintenance/Maintenance"

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-code",
  "/reset-password",
]

function isAuthPath() {
  return AUTH_PATHS.some((p) => window.location.pathname.startsWith(p))
}

function MaintenanceGate({ children }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [state, setState] = useState({ loading: true, maintenance: false })

  useEffect(() => {
    let cancelled = false

    const check = () =>
      api
        .get("/settings")
        .then((res) => {
          if (cancelled) return
          setState((prev) => ({
            ...prev,
            maintenance: Boolean(res.data.data?.maintenanceMode),
          }))
        })
        .catch(() => {
          if (cancelled) return
          setState((prev) => ({ ...prev, maintenance: false }))
        })

    api
      .get("/settings")
      .then((res) => {
        if (cancelled) return
        setState({
          loading: false,
          maintenance: Boolean(res.data.data?.maintenanceMode),
        })
      })
      .catch(() => {
        if (cancelled) return
        setState({ loading: false, maintenance: false })
      })

    const onPop = () => check()

    window.addEventListener("popstate", onPop)

    return () => {
      cancelled = true
      window.removeEventListener("popstate", onPop)
    }
  }, [])

  if (state.loading) {
    return (
      <div
        className={`flex h-screen w-screen items-center justify-center ${
          isDark ? "bg-night" : "bg-paper"
        }`}
      >
        <div
          className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
            isDark ? "border-sky-400" : "border-sky-600"
          }`}
        />
      </div>
    )
  }

  if (state.maintenance && user?.role !== "admin" && !isAuthPath()) {
    return <Maintenance />
  }

  return children
}

export default MaintenanceGate

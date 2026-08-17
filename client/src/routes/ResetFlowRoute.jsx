import { Navigate } from "react-router-dom"

export function ResetFlowRoute({ children, step }) {
  const resetEmail = localStorage.getItem("resetEmail")
  const registerEmail = localStorage.getItem("registerEmail")
  const profileEmail = localStorage.getItem("profileEmail")
  const isOtpVerified = localStorage.getItem("otpVerified")

  if (step === "verify" && !resetEmail && !registerEmail && !profileEmail) {
    return <Navigate to="/login" replace />
  }

  if (step === "reset" && !isOtpVerified) {
    return <Navigate to="/forgot-password" replace />
  }

  return children
}

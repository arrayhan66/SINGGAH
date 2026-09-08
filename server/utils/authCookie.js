const COOKIE_NAME = "singgah_token"
const SESSION_MS = 2 * 60 * 60 * 1000

const isProduction = () => process.env.NODE_ENV === "production"

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_MS,
  }
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions())
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
  })
}

function getTokenFromCookie(req) {
  const cookieHeader = req.headers.cookie || ""
  if (!cookieHeader) return null

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))

  if (!match) return null
  return decodeURIComponent(match.slice(COOKIE_NAME.length + 1))
}

module.exports = {
  COOKIE_NAME,
  SESSION_MS,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromCookie,
}
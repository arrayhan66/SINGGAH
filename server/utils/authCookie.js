const COOKIE_NAME = "singgah_token";
const SESSION_MS = 6 * 60 * 60 * 1000;

const isProduction = () => process.env.NODE_ENV === "production";

// Default "lax" karena frontend memanggil API lewat rewrite Vercel pada origin
// yang sama (client/vercel.json), sehingga cookie-nya first-party dan tidak
// pernah terkena aturan same-site lintas domain.
//
// Set AUTH_COOKIE_SAMESITE=none hanya kalau frontend BENAR-BENAR memanggil API
// lewat domain berbeda (mis. VITE_API_URL diisi URL absolut). "none" memaksa
// cookie terkirim lintas origin, jadi harus memakai Secure, dan browser hanya
// mengizinkan bila situsnya HTTPS.
function sameSite() {
  const raw = String(process.env.AUTH_COOKIE_SAMESITE || "none").toLowerCase();
  if (raw === "none" || raw === "strict" || raw === "lax") return raw;
  return "none";
}

function cookieOptions() {
  const same = sameSite();
  return {
    httpOnly: true,
    sameSite: same,
    // SameSite=None tidak boleh tanpa Secure.
    secure: same === "none" ? true : isProduction(),
    path: "/",
    maxAge: SESSION_MS,
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearAuthCookie(res) {
  const same = sameSite();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: same,
    secure: same === "none" ? true : isProduction(),
    path: "/",
  });
}

function getTokenFromCookie(req) {
  const cookieHeader = req.headers.cookie || "";
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;
  return decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
}

module.exports = {
  COOKIE_NAME,
  SESSION_MS,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromCookie,
};

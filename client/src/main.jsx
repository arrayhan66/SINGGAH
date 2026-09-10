import "./three/polyfills/forceWebgl2"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import "./styles/global-light.css"
import App from "./App.jsx"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { NotificationProvider } from "./context/NotificationContext"

// Pesan ini datang dari iframe Google/ekstensi browser saat port komunikasinya
// ditutup duluan (mis. navigasi cepat). Tidak memengaruhi aplikasi, jadi
// dibuang dari console.
const MESSAGE_PORT_NOISE = /message port closed/i

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason
  const text = reason?.message ? String(reason.message) : String(reason ?? "")
  const stack = reason?.stack ? String(reason.stack) : ""
  if (MESSAGE_PORT_NOISE.test(text) || MESSAGE_PORT_NOISE.test(stack)) {
    event.preventDefault()
  }
})

// Baris-baris noise dari library/ekstensi pihak ketiga yang tidak bisa
// dihilangkan dari sumbernya. Context Restore/Clock deprecation berasal dari
// three.js / @react-three/fiber (aplikasi sudah punya webglGuard untuk
// recovery), sementara reportAllChanges datang dari skrip web-vitals yang
// disuntikkan ekstensi browser.
const NOISE_SUBSTRINGS = [
  "THREE.Clock: This module has been deprecated.",
  "THREE.WebGLRenderer: Context Lost.",
  "THREE.WebGLRenderer: Context Restored.",
]

function isNoise(args) {
  const first = typeof args[0] === "string" ? args[0] : ""
  return NOISE_SUBSTRINGS.some((s) => first.includes(s))
}

const originalLog = console.log
const originalWarn = console.warn
const originalError = console.error
console.log = (...args) => {
  if (!isNoise(args)) originalLog(...args)
}
console.warn = (...args) => {
  if (!isNoise(args)) originalWarn(...args)
}
console.error = (...args) => {
  if (!isNoise(args)) originalError(...args)
}

window.addEventListener("error", (event) => {
  const message = event.message || ""
  const stack = event.error && event.error.stack ? event.error.stack : ""
  if (
    MESSAGE_PORT_NOISE.test(message) ||
    MESSAGE_PORT_NOISE.test(stack) ||
    stack.includes("reportAllChanges") ||
    message.includes("Cannot read properties of undefined (reading 'startTime')")
  ) {
    event.preventDefault()
  }
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

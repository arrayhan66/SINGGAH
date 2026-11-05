const CSS_VAR = "--snav-font"
const FONT_STACK = "'Quicksand', sans-serif"
const GOOGLE_URL =
  "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"

let loaded = false

function loadFont() {
  if (loaded || typeof document === "undefined") return
  loaded = true
  if (document.querySelector('link[data-navbar-font="quicksand"]')) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = GOOGLE_URL
  link.dataset.navbarFont = "quicksand"
  document.head.appendChild(link)
}

export function applyNavbarFont() {
  loadFont()
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty(CSS_VAR, FONT_STACK)
  }
}

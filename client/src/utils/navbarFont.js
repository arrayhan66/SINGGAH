const CSS_VAR = "--snav-font"
const FONT_STACK =
  "'Google Sans Flex', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

export function applyNavbarFont() {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty(CSS_VAR, FONT_STACK)
  }
}

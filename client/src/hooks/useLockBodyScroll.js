import { useEffect } from "react"

export default function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return
    const html = document.documentElement
    const wasLocked = html.classList.contains("no-scroll")
    html.classList.add("no-scroll")
    return () => {
      if (!wasLocked) html.classList.remove("no-scroll")
    }
  }, [active])
}
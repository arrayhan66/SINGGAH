import { useEffect } from "react"
import { useThree } from "@react-three/fiber"

export default function useContextLoss() {
  const gl = useThree((s) => s.gl)
  const set = useThree((s) => s.set)

  useEffect(() => {
    const canvas = gl.domElement
    let restoreTimer

    const onLost = (e) => {
      e.preventDefault()
      set({ frameloop: "never" })
    }

    const onRestored = () => {
      window.clearTimeout(restoreTimer)
      restoreTimer = window.setTimeout(() => set({ frameloop: "always" }), 250)
    }

    canvas.addEventListener("webglcontextlost", onLost, false)
    canvas.addEventListener("webglcontextrestored", onRestored, false)

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      window.clearTimeout(restoreTimer)
    }
  }, [gl, set])
}

export function ContextLossGuard() {
  useContextLoss()
  return null
}
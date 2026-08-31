import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Sparkles } from "@react-three/drei"

function DustBackground({ color = "#7dd3fc", count = 80 }) {
  const wrapRef = useRef(null)
  const scrollingRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [inView, setInView] = useState(false)
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setMounted(true)
      },
      { rootMargin: "100px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let timer
    const onScroll = () => {
      if (!scrollingRef.current) setScrolling(true)
      scrollingRef.current = true
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        scrollingRef.current = false
        setScrolling(false)
      }, 150)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.clearTimeout(timer)
    }
  }, [])

  const playing = mounted && inView && !scrolling

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0">
      {mounted && (
        <Canvas
          frameloop={playing ? "always" : "never"}
          camera={{ position: [0, 0, 5], fov: 60 }}
          style={{ pointerEvents: "none" }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <Sparkles
            count={count}
            scale={[12, 8, 6]}
            size={2.5}
            speed={0.3}
            opacity={0.6}
            color={color}
          />
        </Canvas>
      )}
    </div>
  )
}

export default DustBackground
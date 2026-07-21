import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Sparkles } from "@react-three/drei"

function DustBackground({ color = "#7dd3fc", count = 150 }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-100px" },
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {isVisible && (
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
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

import { useState } from "react"
import { useGLTF } from "@react-three/drei"

function Mahasiswa(props) {
  const { scene } = useGLTF("/models/mahasiswa.glb")
  const [hovered, setHovered] = useState(false)

  return (
    <primitive
      object={scene}
      {...props}
      onPointerOver={() => {
        document.body.style.cursor = "pointer"
        setHovered(true)
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default"
        setHovered(false)
      }}
    />
  )
}

useGLTF.preload("/models/mahasiswa.glb")

export default Mahasiswa

import { useGLTF } from "@react-three/drei"

function Mahasiswa(props) {
  const { scene } = useGLTF("/models/mahasiswa.glb")

  return (
    <primitive
      object={scene}
      {...props}
      onPointerOver={() => {
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default"
      }}
    />
  )
}

export default Mahasiswa

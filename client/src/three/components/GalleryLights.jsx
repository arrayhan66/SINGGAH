function GalleryLights() {
  return (
    <>
      <hemisphereLight args={["#cfe0f5", "#1e3a5f", 0.95]} />
      <ambientLight intensity={0.75} color="#bfe0ff" />
      {/* Shadow map = render ulang seluruh scene per lampu — mahal banget di
          iGPU/GPU menengah dan hanya memberi bayangan lembut yang nyaris tak
          terlihat di ruang museum. Dinonaktifkan agar stabil di semua tier. */}
      <directionalLight position={[15, 24, 10]} intensity={1.3} color="#e4f1ff" />
    </>
  )
}

export default GalleryLights
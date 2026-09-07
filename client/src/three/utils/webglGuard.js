// Penjaga kegagalan/loss WebGL context.
// Tanpa ini, @react-three/fiber tetap merender walau context sudah hilang
// sehingga scene 3D bisa freeze/hitam permanen dan membanjiri warning
// "THREE.WebGLRenderer: Context Lost." Setelah context dipulihkan browser,
// callback onRestore dipakai untuk me-remount Canvas (context baru yang sehat).
export function attachWebGLContextGuard(gl, onRestore) {
  const el = gl && gl.domElement
  if (!el) return () => {}

  const onLost = (event) => {
    event.preventDefault()
    try {
      gl.setAnimationLoop(null)
    } catch {
      // render loop milik r3f; kalau gagal di-stop, abaikan
    }
  }

  const onRestored = () => {
    try {
      if (typeof onRestore === "function") onRestore()
    } catch {
      // abaikan error pada saat remount
    }
  }

  el.addEventListener("webglcontextlost", onLost, false)
  el.addEventListener("webglcontextrestored", onRestored, false)

  return () => {
    el.removeEventListener("webglcontextlost", onLost)
    el.removeEventListener("webglcontextrestored", onRestored)
  }
}
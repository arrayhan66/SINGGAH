// Penjaga kegagalan/loss WebGL context.
// Tanpa ini, @react-three/fiber tetap merender walau context sudah hilang
// sehingga scene 3D bisa freeze/hitam permanen dan membanjiri warning
// "THREE.WebGLRenderer: Context Lost." Setelah context dipulihkan browser,
// callback onRestore dipakai untuk me-remount Canvas (context baru yang sehat).
export function attachWebGLContextGuard(gl, onRestore) {
  const el = gl && gl.domElement
  if (!el) return () => {}

  let remountTimer = null
  let lastRemountAt = 0
  const REMOUNT_GAP = 1500

  const scheduleRemount = () => {
    if (Date.now() - lastRemountAt < REMOUNT_GAP) return
    if (document.visibilityState !== "visible") return
    if (!el.isConnected) return
    lastRemountAt = Date.now()
    window.clearTimeout(remountTimer)
    remountTimer = window.setTimeout(() => {
      try {
        if (typeof onRestore === "function") onRestore()
      } catch {
        // abaikan error pada saat remount
      }
    }, 250)
  }

  const onLost = (event) => {
    event.preventDefault()
    try {
      gl.setAnimationLoop(null)
    } catch {
      // render loop milik r3f; kalau gagal di-stop, abaikan
    }
  }

  const onRestored = () => scheduleRemount()

  el.addEventListener("webglcontextlost", onLost, false)
  el.addEventListener("webglcontextrestored", onRestored, false)

  return () => {
    el.removeEventListener("webglcontextlost", onLost)
    el.removeEventListener("webglcontextrestored", onRestored)
    window.clearTimeout(remountTimer)
  }
}
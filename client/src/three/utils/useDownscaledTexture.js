import { use } from "react"
import * as THREE from "three"
import { getAnisotropy } from "../hooks/useQuality"

// Decode + downscale an image once per URL and share the texture app-wide.
// Using createImageBitmap's resizeWidth keeps the GPU memory low for textures
// that only ever cover a small area on screen (book covers, portraits, logos).
//
// NOTE: Texture.flipY is IGNORED for ImageBitmap sources (WebGL does not apply
// UNPACK_FLIP_Y_WEBGL to them). To match TextureLoader's default upright look
// the flip must happen at bitmap creation via imageOrientation: "flipY".
const cache = new Map()

function loadImage(url, maxWidth) {
  let promise = cache.get(url)
  if (promise) return promise
  promise = (async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to load image: ${url}`)
    const blob = await res.blob()
    const options = { imageOrientation: "flipY", premultiplyAlpha: "none" }
    if (maxWidth > 0) {
      options.resizeWidth = maxWidth
      options.resizeQuality = "high"
    }
    const bitmap = await createImageBitmap(blob, options)
    const texture = new THREE.CanvasTexture(bitmap)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = getAnisotropy()
    texture.needsUpdate = true
    return texture
  })().catch((err) => {
    cache.delete(url)
    throw err
  })
  cache.set(url, promise)
  return promise
}

export function useDownscaledTexture(url, maxWidth = 256) {
  return use(loadImage(url, maxWidth))
}

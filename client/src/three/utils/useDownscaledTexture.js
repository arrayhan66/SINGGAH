import { use } from "react"
import * as THREE from "three"
import { getAnisotropy, textureBudgetFactor } from "../hooks/useQuality"

// Decode + downscale an image once per URL and share the texture app-wide.
// Using createImageBitmap's resizeWidth keeps the GPU memory low for textures
// that only ever cover a small area on screen (book covers, portraits, logos).
//
// NOTE: Texture.flipY is IGNORED for ImageBitmap sources (WebGL does not apply
// UNPACK_FLIP_Y_WEBGL to them). To match TextureLoader's default upright look
// the flip must happen at bitmap creation via imageOrientation: "flipY".
const cache = new Map()

// Classic <img> decode fallback for browsers without createImageBitmap
// (older Safari/iOS) or where the resize/imageOrientation options throw.
// ImageBitmapData is not involved, so flipY applies normally on CanvasTexture.
function decodeViaImage(url, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => {
      try {
        const iw = img.naturalWidth || img.videoWidth || 1
        const ih = img.naturalHeight || img.videoHeight || 1
        const scale = maxWidth > 0 ? Math.min(1, maxWidth / iw) : 1
        const w = Math.max(1, Math.round(iw * scale))
        const h = Math.max(1, Math.round(ih * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, w, h)
        const texture = new THREE.CanvasTexture(canvas)
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = getAnisotropy()
        texture.needsUpdate = true
        resolve(texture)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

function decodeViaBitmap(url, maxWidth) {
  return (async () => {
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
  })()
}

function loadImage(url, maxWidth) {
  // Sesuaikan maxWidth dengan budget tier (HP ringan dapat tekstur lebih kecil
  // -> RAM GPU & waktu decode turun drastis, tetap tajam di layar kecil).
  const factor = textureBudgetFactor()
  if (factor !== 1) maxWidth = Math.max(192, Math.round(maxWidth * factor))
  let promise = cache.get(url)
  if (promise) return promise
  const canBitmap = typeof createImageBitmap === "function"
  promise = (canBitmap ? decodeViaBitmap(url, maxWidth) : decodeViaImage(url, maxWidth)).catch(
    (err) => {
      // Some WebGL builds / mobile browsers throw inside createImageBitmap
      // despite the API existing (unsupported option combo). Falling back to
      // the <img> path keeps the scene (portals, paintings) from going blank.
      if (canBitmap) return decodeViaImage(url, maxWidth)
      cache.delete(url)
      throw err
    },
  )
  cache.set(url, promise)
  return promise
}

// Fire a load early (e.g. portal logo) so the texture is decoded and cached
// before the hall scene mounts — the same cache feed useDownscaledTexture.
export function preloadTexture(url, maxWidth = 256) {
  if (!url) return
  void loadImage(url, maxWidth)
}

export function useDownscaledTexture(url, maxWidth = 256) {
  return use(loadImage(url, maxWidth))
}
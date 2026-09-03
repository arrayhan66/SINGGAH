export async function compressImage(file, { maxWidth = 800, maxHeight = 800, quality = 0.85, maxSize = 2 * 1024 * 1024 } = {}) {
  if (!file || !file.type || !file.type.startsWith("image/")) return file

  if (file.size <= maxSize) {
    const isSmallEnough =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp"
    if (isSmallEnough) return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    const scale = Math.min(1, maxWidth / width, maxHeight / height)
    const w = Math.max(1, Math.round(width * scale))
    const h = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    let blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    )

    if (blob && blob.size > maxSize) {
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", Math.max(0.5, quality * 0.7)),
      )
    }

    if (!blob) return file

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return new File([blob], name, { type: "image/jpeg" })
  } catch {
    return file
  }
}

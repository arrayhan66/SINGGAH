const MIME_BY_EXT = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  zip: "application/zip",
  rar: "application/vnd.rar",
}

const isPdf = (name) => /\.pdf$/i.test(name || "")

function getExtension(name) {
  const match = (name || "").toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ""
}

function toBlobWithMime(blob, name) {
  const type = MIME_BY_EXT[getExtension(name)] || blob.type || "application/octet-stream"
  if (type === blob.type) return blob
  return new Blob([blob], { type })
}

function getBlobUrl(blob) {
  return URL.createObjectURL(blob)
}

export async function openDocument(doc) {
  if (!doc || !doc.file_url) return

  try {
    const res = await fetch(doc.file_url)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const blob = toBlobWithMime(await res.blob(), doc.name)
    const url = getBlobUrl(blob)

    if (isPdf(doc.name)) {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      const a = document.createElement("a")
      a.href = url
      a.download = doc.name || "dokumen"
      document.body.appendChild(a)
      a.click()
      a.remove()
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch {
    window.alert(
      "Dokumen tidak dapat diakses. Silakan coba lagi atau unggah ulang melalui Edit Karya.",
    )
  }
}

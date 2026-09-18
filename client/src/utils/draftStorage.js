export const UPLOAD_FIELDS_KEY = "singgah-upload-fields"
export const UPLOAD_FILES_KEY = "singgah-upload-files"

const DB_NAME = "singgah"
const DB_VERSION = 1
const STORE = "drafts"

let dbPromise = null

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("indexedDB tidak tersedia"))
        return
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE)
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    dbPromise = dbPromise.catch(() => {
      dbPromise = null
      throw new Error("gagal buka indexeddb")
    })
  }
  return dbPromise
}

export async function putDraft(key, value) {
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite")
      tx.objectStore(STORE).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } catch {
    // Mode privat/penyimpanan penuh: biarkan, jangan ganggu pengguna.
  }
}

export async function getDraft(key) {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly")
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function clearDraft(key) {
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite")
      tx.objectStore(STORE).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
  } catch {
    // abaikan
  }
}

// Hapus seluruh draft form upload karya (sessionStorage + IndexedDB).
// Dipanggil saat logout / setelah submit, supaya form upload tidak "turun
// temurun" membawa galeri & dokumen milik user sebelumnya.
export async function clearUploadDraft() {
  try {
    sessionStorage.removeItem(UPLOAD_FIELDS_KEY)
  } catch {
    // abaikan
  }
await clearDraft(UPLOAD_FILES_KEY)
}
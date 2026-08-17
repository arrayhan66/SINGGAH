// Cache TTL sederhana dalam memori. Dinonaktifkan saat mode test agar
// deterministik dan tidak mencemari antar test file.
const isTest = process.env.NODE_ENV === "test"

const store = new Map()

const CACHE_DISABLED_MSG = "Cache disabled in test mode"

exports.get = (key) => {
  if (isTest) return undefined

  const item = store.get(key)
  if (!item) return undefined

  if (Date.now() > item.expiresAt) {
    store.delete(key)
    return undefined
  }

  return item.value
}

exports.set = (key, value, ttlMs = 60000) => {
  if (isTest) return CACHE_DISABLED_MSG

  store.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

exports.del = (key) => {
  if (isTest) return CACHE_DISABLED_MSG

  store.delete(key)
  return true
}

exports.clear = () => {
  store.clear()
  return true
}

exports.delPrefix = (prefix) => {
  if (isTest) return CACHE_DISABLED_MSG

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key)
    }
  }

  return true
}

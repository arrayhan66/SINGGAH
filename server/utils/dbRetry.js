function isConnectionError(error) {
  return (
    error &&
    (error.name === "SequelizeConnectionError" ||
      error.name === "SequelizeConnectionRefusedError" ||
      error.name === "SequelizeHostNotFoundError" ||
      error.name === "SequelizeConnectionTimedOutError" ||
      error.name === "SequelizeConnectionAcquireTimeoutError" ||
      error.name === "SequelizeHostNotReachableError" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNRESET" ||
      error.code === "ENOTFOUND")
  )
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Ulangi query sekali-dua kali jika gagal karena koneksi DB sempat putus
// (ENOTFOUND / ETIMEDOUT / ECONNRESET ke TiDB Cloud). Blip singkat nggak
// langsung bikin request gagal.
async function withDbRetry(fn, { retries = 2, delay = 300 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isConnectionError(error) || attempt === retries) break
      await sleep(delay * (attempt + 1))
    }
  }
  throw lastError
}

module.exports = { isConnectionError, withDbRetry }
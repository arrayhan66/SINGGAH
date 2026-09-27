const { isConnectionError, withDbRetry } = require("../utils/dbRetry")

const connectionError = () => {
  const err = new Error("koneksi database putus")
  err.name = "SequelizeConnectionError"
  return err
}

const codeError = (code) => {
  const err = new Error(code)
  err.code = code
  return err
}

describe("utils/dbRetry", () => {
  describe("isConnectionError", () => {
    it("should detect every sequelize connection error name", () => {
      const names = [
        "SequelizeConnectionError",
        "SequelizeConnectionRefusedError",
        "SequelizeHostNotFoundError",
        "SequelizeConnectionTimedOutError",
        "SequelizeConnectionAcquireTimeoutError",
        "SequelizeHostNotReachableError",
      ]

      names.forEach((name) => {
        const err = new Error("x")
        err.name = name
        expect(isConnectionError(err)).toBe(true)
      })
    })

    it("should detect network error codes", () => {
      expect(isConnectionError(codeError("ETIMEDOUT"))).toBe(true)
      expect(isConnectionError(codeError("ECONNRESET"))).toBe(true)
      expect(isConnectionError(codeError("ENOTFOUND"))).toBe(true)
    })

    it("should reject non-connection failures", () => {
      const dbError = new Error("syntax error")
      dbError.name = "SequelizeDatabaseError"

      expect(isConnectionError(dbError)).toBe(false)
      expect(isConnectionError(new Error("boom"))).toBe(false)
      expect(isConnectionError(codeError("EACCES"))).toBe(false)
      expect(isConnectionError(null)).toBeFalsy()
      expect(isConnectionError(undefined)).toBeFalsy()
    })
  })

  describe("withDbRetry", () => {
    it("should return the result without retrying when the call succeeds", async () => {
      const fn = jest.fn().mockResolvedValue("hasil")

      await expect(withDbRetry(fn, { delay: 1 })).resolves.toBe("hasil")
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should recover when a connection error is transient", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(connectionError())
        .mockResolvedValue("selesai")

      await expect(withDbRetry(fn, { delay: 1 })).resolves.toBe("selesai")
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it("should default to two retries, so three attempts in total", async () => {
      const fn = jest.fn().mockRejectedValue(connectionError())

      await expect(withDbRetry(fn, { delay: 1 })).rejects.toThrow(
        "koneksi database putus",
      )
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it("should not retry when the failure is not a connection error", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("kolom tidak ada"))

      await expect(withDbRetry(fn, { delay: 1 })).rejects.toThrow("kolom tidak ada")
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it("should honour a custom retry budget", async () => {
      const fn = jest.fn().mockRejectedValue(connectionError())

      await expect(withDbRetry(fn, { retries: 0, delay: 1 })).rejects.toThrow()
      expect(fn).toHaveBeenCalledTimes(1)

      fn.mockClear()
      await expect(withDbRetry(fn, { retries: 4, delay: 1 })).rejects.toThrow()
      expect(fn).toHaveBeenCalledTimes(5)
    })

    it("should surface the final error after exhausting every attempt", async () => {
      const lastError = connectionError()
      lastError.message = "percobaan terakhir"
      const fn = jest
        .fn()
        .mockRejectedValueOnce(connectionError())
        .mockRejectedValueOnce(connectionError())
        .mockRejectedValueOnce(lastError)

      await expect(withDbRetry(fn, { delay: 1 })).rejects.toThrow(
        "percobaan terakhir",
      )
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it("should back off longer on each successive attempt", async () => {
      const fn = jest.fn().mockRejectedValue(connectionError())
      const started = Date.now()

      await expect(
        withDbRetry(fn, { retries: 2, delay: 40 }),
      ).rejects.toThrow()

      const elapsed = Date.now() - started
      expect(fn).toHaveBeenCalledTimes(3)
      expect(elapsed).toBeGreaterThanOrEqual(110)
    })

    it("should propagate a resolved value that is falsy without retrying", async () => {
      const fn = jest.fn().mockResolvedValue(null)

      await expect(withDbRetry(fn, { delay: 1 })).resolves.toBeNull()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})

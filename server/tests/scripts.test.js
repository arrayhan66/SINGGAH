const { sequelize } = require("../models")
const ensureGoogleIdColumn = require("../scripts/ensureGoogleIdColumn")
const ensureSlideshowColumn = require("../scripts/ensureSlideshowColumn")

describe("scripts migrasi database", () => {
  let qi

  beforeAll(() => {
    qi = sequelize.getQueryInterface()
  })

  describe("ensureGoogleIdColumn", () => {
    it("should add the google_id column when it is missing", async () => {
      const spy = jest.spyOn(qi, "describeTable").mockResolvedValue({})
      const addColumn = jest.spyOn(qi, "addColumn").mockResolvedValue()
      const addIndex = jest.spyOn(qi, "addIndex").mockResolvedValue()
      const logger = require("../utils/logger")
      const warn = jest.spyOn(logger, "warn").mockResolvedValue()
      const info = jest.spyOn(logger, "info").mockResolvedValue()

      await expect(ensureGoogleIdColumn()).resolves.not.toThrow()

      expect(spy).toHaveBeenCalledWith("users")
      expect(addColumn).toHaveBeenCalledWith(
        "users",
        "google_id",
        expect.objectContaining({ allowNull: true, defaultValue: null }),
      )
      expect(addIndex).toHaveBeenCalledWith("users", ["google_id"], expect.any(Object))
      expect(info).toHaveBeenCalledWith("Column users.google_id ditambahkan")

      spy.mockRestore()
      addColumn.mockRestore()
      addIndex.mockRestore()
      warn.mockRestore()
      info.mockRestore()
    })

    it("should skip when the column already exists", async () => {
      const spy = jest.spyOn(qi, "describeTable").mockResolvedValue({
        google_id: { type: "STRING" },
      })
      const addColumn = jest.spyOn(qi, "addColumn").mockResolvedValue()

      await expect(ensureGoogleIdColumn()).resolves.not.toThrow()
      expect(spy).toHaveBeenCalledWith("users")
      expect(addColumn).not.toHaveBeenCalled()

      spy.mockRestore()
      addColumn.mockRestore()
    })

    it("should tolerate an error from describeTable and not crash", async () => {
      const spy = jest.spyOn(qi, "describeTable").mockRejectedValue(new Error("table locked"))
      const logger = require("../utils/logger")
      const error = jest.spyOn(logger, "error").mockResolvedValue()

      await expect(ensureGoogleIdColumn()).resolves.not.toThrow()
      expect(spy).toHaveBeenCalledWith("users")
      expect(error).toHaveBeenCalledWith("ensureGoogleIdColumn:", expect.any(String))

      spy.mockRestore()
      error.mockRestore()
    })

    it("should swallow a failing index creation and still resolve", async () => {
      const logger = require("../utils/logger")
      const spy = jest.spyOn(qi, "describeTable").mockResolvedValue({})
      const addColumn = jest.spyOn(qi, "addColumn").mockResolvedValue()
      const addIndex = jest.spyOn(qi, "addIndex").mockRejectedValue(new Error("index gagal"))
      const warn = jest.spyOn(logger, "warn").mockResolvedValue()

      await expect(ensureGoogleIdColumn()).resolves.not.toThrow()
      expect(addIndex).toHaveBeenCalled()
      expect(warn).toHaveBeenCalledWith("Index google_id:", expect.any(String))

      spy.mockRestore()
      addColumn.mockRestore()
      addIndex.mockRestore()
      warn.mockRestore()
    })
  })

  describe("ensureSlideshowColumn", () => {
    it("should add is_shown_in_slideshow when it is missing", async () => {
      const spy = jest.spyOn(qi, "describeTable").mockResolvedValue({})
      const addColumn = jest.spyOn(qi, "addColumn").mockResolvedValue()
      const info = jest.spyOn(require("../utils/logger"), "info").mockResolvedValue()

      await expect(ensureSlideshowColumn()).resolves.not.toThrow()
      expect(spy).toHaveBeenCalledWith("projects")
      expect(addColumn).toHaveBeenCalledWith(
        "projects",
        "is_shown_in_slideshow",
        expect.objectContaining({ allowNull: false, defaultValue: false }),
      )
      expect(info).toHaveBeenCalledWith("Column projects.is_shown_in_slideshow ditambahkan")

      spy.mockRestore()
      addColumn.mockRestore()
      info.mockRestore()
    })

    it("should skip when the column already exists", async () => {
      const spy = jest.spyOn(qi, "describeTable").mockResolvedValue({
        is_shown_in_slideshow: { type: "BOOLEAN" },
      })
      const addColumn = jest.spyOn(qi, "addColumn").mockResolvedValue()

      await expect(ensureSlideshowColumn()).resolves.not.toThrow()
      expect(addColumn).not.toHaveBeenCalled()

      spy.mockRestore()
      addColumn.mockRestore()
    })
  })
})

const { User } = require("../models")
const cache = require("../utils/cache")
const { createUser } = require("./helpers")

const AUTH_CACHE_PREFIX = "auth:user:"

describe("User model auth-cache invalidation hooks", () => {
  let alice
  let bob

  beforeAll(async () => {
    await User.destroy({ where: {} })

    alice = await createUser({
      name: "Alice Cache",
      username: "alicecache",
      email: "alicecache@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010031",
    })
    bob = await createUser({
      name: "Bob Cache",
      username: "bobcache",
      email: "bobcache@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010032",
    })
  })

  it("should invalidate the cache after a single save", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    alice.role = "admin"
    await alice.save()

    expect(spy).toHaveBeenCalledWith(AUTH_CACHE_PREFIX + alice.id)
    spy.mockRestore()
  })

  it("should invalidate the cache after a destroy", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)
    const victim = await createUser({
      name: "Korban Cache",
      username: "korbancache",
      email: "korbancache@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010033",
    })

    await victim.destroy()

    expect(spy).toHaveBeenCalledWith(AUTH_CACHE_PREFIX + victim.id)
    spy.mockRestore()
  })

  it("should read the id from options.where on a bulk update", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    await User.update({ role: "dosen" }, { where: { id: bob.id } })

    expect(spy).toHaveBeenCalledWith(AUTH_CACHE_PREFIX + bob.id)
    spy.mockRestore()
  })

  it("should invalidate every id on a bulk update using an id list", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    await User.update(
      { role: "reviewer" },
      { where: { id: [alice.id, bob.id] } },
    )

    const keys = spy.mock.calls.map(([key]) => key)
    expect(keys).toContain(AUTH_CACHE_PREFIX + alice.id)
    expect(keys).toContain(AUTH_CACHE_PREFIX + bob.id)
    spy.mockRestore()
  })

  it("should invalidate from the instances array when individual hooks run", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    await User.update(
      { status: "active" },
      { where: { id: alice.id }, individualHooks: true },
    )

    expect(spy).toHaveBeenCalledWith(AUTH_CACHE_PREFIX + alice.id)
    spy.mockRestore()
  })

  it("should not crash on a bulk update that carries no id to invalidate", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    await expect(
      User.update({ role: "mahasiswa" }, { where: { email: alice.email } }),
    ).resolves.not.toThrow()

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it("should change no rows when the where clause matches nothing", async () => {
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    const [affected] = await User.update(
      { role: "admin" },
      { where: { id: 999999 } },
    )

    expect(affected).toBe(0)
    spy.mockRestore()
  })

  it("should tolerate an operator form in the where clause", async () => {
    const { Op } = require("sequelize")
    const spy = jest.spyOn(cache, "del").mockResolvedValue(1)

    await User.update({ role: "dosen" }, { where: { id: { [Op.eq]: bob.id } } })

    expect(spy).toHaveBeenCalledWith(AUTH_CACHE_PREFIX + bob.id)
    spy.mockRestore()
  })
})

const { User } = require("../models")
const settingService = require("../services/settingService")
const { parsePagination, limitForRole } = require("../utils/pagination")
const singleFlight = require("../utils/singleFlight")
const cache = require("../utils/cache")

// Cache dimatikan otomatis saat NODE_ENV=test supaya test lain deterministik.
// Test ini justru perlu cache yang hidup untuk menguji invalidasi, jadi
// dinyalakan lewat CACHE_IN_TEST (lihat utils/cache.js).
//
// Penting: jangan pakai jest.mock di sini. tests/setup.js memuat
// models/User.js lebih dulu, jadi User akan memegang instance cache asli
// sementara middleware memegang hasil mock. Hook invalidasi lalu tidak
// berefek dan test lolos tanpa benar-benar menguji apa pun.
process.env.CACHE_IN_TEST = "true";

// Diletakkan di top-level (bukan di dalam describe) karena Jest menjalankan
// afterAll sebuah describe tepat setelah test di dalamnya selesai, bukan
// setelah seluruh file. Kalau di dalam describe pertama, flag sudah mati
// sebelum describe invalidasi cache dijalankan.
afterAll(() => {
  delete process.env.CACHE_IN_TEST;
  cache.clear();
});

describe("Cache aktif di mode test", () => {
  it("menyimpan lalu membaca kembali nilai", async () => {
    cache.clear();
    expect(await cache.get("uji:cache")).toBeUndefined();
    await cache.set("uji:cache", { a: 1 }, 60000);
    expect(await cache.get("uji:cache")).toEqual({ a: 1 });
  });

  it("delPrefix menghapus semua key dengan prefix", async () => {
    cache.clear();
    await cache.set("kelompok:a", 1, 60000);
    await cache.set("kelompok:b", 2, 60000);
    await cache.set("lain:a", 3, 60000);

    await cache.delPrefix("kelompok:");

    expect(await cache.get("kelompok:a")).toBeUndefined();
    expect(await cache.get("kelompok:b")).toBeUndefined();
    expect(await cache.get("lain:a")).toBe(3);
  });
});

describe("Pembatas pagination", () => {
  it("menahan limit yang jauh melebihi batas publik", () => {
    expect(parsePagination({ page: 1, limit: 1000000 })).toEqual({
      page: 1,
      limit: 100,
      offset: 0,
    });
  });

  it("memberi admin batas lebih besar daripada user biasa", () => {
    expect(
      parsePagination({ page: 1, limit: 1000000 }, limitForRole("admin", 10)),
    ).toEqual({ page: 1, limit: 500, offset: 0 });

    expect(
      parsePagination({ page: 1, limit: 1000000 }, limitForRole("user", 10)).limit,
    ).toBe(100);
  });

  it("menormalkan input tidak valid", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, offset: 0 });
    expect(parsePagination({ page: "abc", limit: "abc" })).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
    });
    expect(parsePagination({ page: -9, limit: -4 })).toEqual({
      page: 1,
      limit: 1,
      offset: 0,
    });
  });

  it("menghitung offset dari page yang valid", () => {
    expect(parsePagination({ page: 3, limit: 20 })).toEqual({
      page: 3,
      limit: 20,
      offset: 40,
    });
  });

  it("selalu mengembalikan page/limit sebagai angka, bukan undefined", () => {
    // Regresi: destructuring dengan nama yang salah membuat Sequelize
    // mengabaikan limit sehingga menarik seluruh tabel.
    for (const input of [{}, { limit: "10" }, { page: "2" }]) {
      const result = parsePagination(input, limitForRole(null, 10));
      expect(typeof result.page).toBe("number");
      expect(typeof result.limit).toBe("number");
      expect(Number.isFinite(result.offset)).toBe(true);
    }
  });
});

describe("Single flight", () => {
  it("hanya menjalankan fn satu kali untuk key yang sama", async () => {
    let calls = 0;
    const fn = async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 20));
      return calls;
    };

    const results = await Promise.all([
      singleFlight("k-sama", fn),
      singleFlight("k-sama", fn),
      singleFlight("k-sama", fn),
    ]);

    expect(calls).toBe(1);
    expect(results).toEqual([1, 1, 1]);
  });

  it("mengizinkan key yang sama dijalankan lagi setelah promise selesai", async () => {
    let calls = 0;
    const fn = async () => {
      calls += 1;
      return calls;
    };

    await singleFlight("k-berikutnya", fn);
    await singleFlight("k-berikutnya", fn);

    expect(calls).toBe(2);
  });
});

describe("Cache Setting", () => {
  afterEach(async () => {
    await settingService.updateSettings({ maintenanceMode: false });
  });

  it("langsung terbaca setelah di-update, tidak menunggu TTL habis", async () => {
    await settingService.updateSettings({ maintenanceMode: false });
    expect(await settingService.getSetting("maintenanceMode")).toBe(false);

    await settingService.updateSettings({ maintenanceMode: true });
    expect(await settingService.getSetting("maintenanceMode")).toBe(true);
  });

  it("getSettings ikut di-invalidasi", async () => {
    await settingService.updateSettings({ maintenanceMode: true });
    expect((await settingService.getSettings()).maintenanceMode).toBe(true);

    await settingService.updateSettings({ maintenanceMode: false });
    expect((await settingService.getSettings()).maintenanceMode).toBe(false);
  });

  it("mengembalikan null untuk key yang tidak ada", async () => {
    expect(await settingService.getSetting("key-yang-tidak-ada-12345")).toBeNull();
  });
});

describe("Invalidasi cache user saat role atau status berubah", () => {
  const makeUser = (overrides = {}) =>
    User.create({
      name: "Cache Test",
      username: "cachetest",
      email: "cachetest@example.com",
      password: "Password123!",
      role: "user",
      status: "active",
      is_verified: true,
      ...overrides,
    });

  it("perubahan role langsung berlaku, tidak menunggu TTL", async () => {
    const { loadUser } = require("../middlewares/authMiddleware");
    const user = await makeUser();

    const first = await loadUser(user.id);
    expect(first).toBeTruthy();
    expect(first.role).toBe("user");

    // Menurunkan atau menaikkan admin harus langsung berlaku demi keamanan.
    user.role = "admin";
    await user.save();

    expect((await loadUser(user.id)).role).toBe("admin");

    await user.destroy();
  });

  it("perubahan status langsung berlaku", async () => {
    const { loadUser } = require("../middlewares/authMiddleware");
    const user = await makeUser({ username: "cachetest_status", email: "cachestatus@example.com" });

    expect((await loadUser(user.id)).status).toBe("active");

    user.status = "inactive";
    await user.save();

    expect((await loadUser(user.id)).status).toBe("inactive");

    await user.destroy();
  });

  it("pembacaan kedua dilayani dari cache, bukan database", async () => {
    const { loadUser } = require("../middlewares/authMiddleware");
    const user = await makeUser({ username: "cachetest_hit", email: "cachehit@example.com" });

    const first = await loadUser(user.id);
    // Cache miss -> loadUser mengembalikan instance Sequelize.
    expect(typeof first.get).toBe("function");

    const second = await loadUser(user.id);
    // Cache hit -> objek biasa hasil JSON, tanpa method Sequelize.
    expect(second).toBeTruthy();
    expect(second.id).toBe(user.id);
    expect(typeof second.get).toBe("undefined");

    // Password tidak boleh ikut ter-cache.
    expect(second.password).toBeUndefined();

    await user.destroy();
  });

  it("user yang dihapus tidak lagi dikembalikan dari cache", async () => {
    const { loadUser } = require("../middlewares/authMiddleware");
    const user = await makeUser({ username: "cachetest_del", email: "cachedel@example.com" });

    expect(await loadUser(user.id)).toBeTruthy();

    await user.destroy();

    expect(await loadUser(user.id)).toBeNull();
  });
});

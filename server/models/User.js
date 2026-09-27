const { DataTypes, Op } = require("sequelize")
const sequelize = require("../config/database")
const cache = require("../utils/cache")

// Prefix ini harus sama dengan yang dipakai middlewares/authMiddleware.js.
const AUTH_CACHE_PREFIX = "auth:user:"

// authMiddleware men-cache user 60 detik supaya tidak satu query database per
// request. Invalidasi dilakukan lewat hook model, bukan edit manual di setiap
// service: ada 6 titik user.save() sekarang dan bisa bertambah nanti, dan
// yang paling penting userService.updateUser bisa mengubah role + status.
//
// utils/cache tidak punya dependensi ke models, jadi require di sini tidak
// menimbulkan circular import.
// Sengaja async: Sequelize menunggu hook yang mengembalikan Promise. Kalau
// hanya memanggil cache.del tanpa await, save() bisa resolve sebelum Redis
// selesai menghapus, sehingga request berikutnya masih membaca role lama.
async function invalidateAuthCache(user) {
  if (user && user.id) {
    await cache.del(AUTH_CACHE_PREFIX + user.id)
  }
}

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    pending_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null,
    },
    google_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
      defaultValue: null,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    identitas_photo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nim_nip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
      defaultValue: "user",
    },

    tipe: {
      type: DataTypes.ENUM("admin", "mahasiswa", "dosen", "umum"),
      allowNull: false,
      defaultValue: "umum",
    },
    pending_tipe: {
      type: DataTypes.ENUM("mahasiswa", "dosen"),
      allowNull: true,
      defaultValue: null,
    },
    rejection_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { name: "users_status", fields: ["status"] },
      { name: "users_pending_email", fields: ["pending_email"] },
    ],
  },
)

User.beforeValidate((user) => {
  if (user.username) {
    user.username = String(user.username).trim().toLowerCase()
  }
})

User.afterSave(invalidateAuthCache)
User.afterDestroy(invalidateAuthCache)
User.afterBulkUpdate(async (options) => {
  // Sequelize v6 memanggil hook bulk dengan SATU argumen `options`, bukan
  // (instances, options). ID diambil dari options.where yang bisa berupa
  // skalar, array, atau { [Op.eq]: nilai }.
  //
  // Hook ini sebelumnya ditulis dengan signature (users, options), sehingga
  // `users` sebenarnya berisi options (bukan array) dan `options` undefined:
  // ids selalu kosong dan cache tidak pernah ter-invalidasi. Akibatnya role/
  // status hasil update massal masih terbaca dari cache selama TTL 60 detik.
  const where = (options && options.where) || {}
  const ids = new Set()

  const collect = (value) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach(collect)
      return
    }
    if (typeof value === "object") {
      if (value[Op.eq] !== undefined) collect(value[Op.eq])
      return
    }
    ids.add(value)
  }

  collect(where.id)

  await Promise.all([...ids].map((id) => cache.del(AUTH_CACHE_PREFIX + id)))
})

module.exports = User

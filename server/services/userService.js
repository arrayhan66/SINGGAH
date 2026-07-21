const { User } = require("../models")
const bcrypt = require("bcryptjs")
const AppError = require("../utils/AppError")

exports.getUsers = async (query = {}) => {
  const { page, limit } = query

  const currentPage = parseInt(page) || 1
  const currentLimit = parseInt(limit) || 10
  const offset = (currentPage - 1) * currentLimit

  const { count, rows } = await User.findAndCountAll({
    attributes: {
      exclude: ["password"],
    },
    order: [["created_at", "DESC"]],
    limit: currentLimit,
    offset,
  })

  return {
    items: rows,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count,
      totalPages: Math.ceil(count / currentLimit),
    },
  }
}

exports.getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: {
      exclude: ["password"],
    },
  })

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  return user
}

exports.createUser = async (data) => {
  const {
    name,
    username,
    email,
    password,
    avatar,
    nim_nip,
    tipe,
    role,
    status,
  } = data

  if (!name || !username || !email || !password) {
    throw new AppError("Nama, username, email, dan password wajib diisi", 400)
  }

  const emailExists = await User.findOne({
    where: {
      email,
    },
  })

  if (emailExists) {
    throw new AppError("Email sudah digunakan", 400)
  }

  const usernameExists = await User.findOne({
    where: {
      username,
    },
  })

  if (usernameExists) {
    throw new AppError("Username sudah digunakan", 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    username,
    email,
    password: hashedPassword,
    avatar: avatar || null,
    nim_nip: nim_nip || null,
    tipe: tipe || "umum",
    role: role || "user",
    status: status || "active",
    is_verified: true,
  })

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    nim_nip: user.nim_nip,
    tipe: user.tipe,
    role: user.role,
    status: user.status,
  }
}

exports.updateUser = async (id, data) => {
  const {
    name,
    username,
    email,
    password,
    avatar,
    nim_nip,
    tipe,
    role,
    status,
  } = data

  const user = await User.findByPk(id)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({
      where: { email },
    })

    if (emailExists) {
      throw new AppError("Email sudah digunakan", 400)
    }
  }

  if (username && username !== user.username) {
    const usernameExists = await User.findOne({
      where: { username },
    })

    if (usernameExists) {
      throw new AppError("Username sudah digunakan", 400)
    }
  }

  user.name = name ?? user.name
  user.username = username ?? user.username
  user.email = email ?? user.email
  user.role = role ?? user.role
  user.status = status ?? user.status
  user.avatar = avatar ?? user.avatar
  user.nim_nip = nim_nip ?? user.nim_nip
  user.tipe = tipe ?? user.tipe

  if (password) {
    user.password = await bcrypt.hash(password, 10)
  }

  await user.save()

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    nim_nip: user.nim_nip,
    tipe: user.tipe,
    role: user.role,
    status: user.status,
  }
}

exports.deleteUser = async (id) => {
  const user = await User.findByPk(id)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  await user.destroy()

  return true
}

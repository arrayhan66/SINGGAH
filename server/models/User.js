const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

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
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    avatar: {
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
  },
)

module.exports = User

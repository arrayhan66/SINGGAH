const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Category = sequelize.define(
  "Category",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Kunci ikon lucide yang dipakai frontend (globe, smartphone, cpu, dll)",
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Warna aksen kategori (hex), dipakai hall 3D",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Urutan tampil kategori di hall 3D",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Menentukan ruangan kategori ditampilkan di hall 3D atau tidak",
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  },
)

module.exports = Category

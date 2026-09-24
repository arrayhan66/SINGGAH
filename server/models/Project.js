const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Project = sequelize.define(
  "Project",
  {
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "published", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    rejection_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    approve_note: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    // Tipe penulis karya (mahasiswa/dosen). Dipakai klasifikasi hall 3D dan
    // pembagian slot per kategori. Admin memilih field ini saat menambah karya
    // atas nama mahasiswa/dosen. null berarti mengikuti tipe akun pembuat
    // (User.tipe).
    author_tipe: {
      type: DataTypes.ENUM("mahasiswa", "dosen"),
      allowNull: true,
      defaultValue: null,
    },
    // Karya unggulan di podium hall 3D. Ada 2 slot (1 & 2) PER TIPE PENULIS
    // dalam satu kategori → tiap portal bisa punya hingga 4 karya unggulan
    // (2 mahasiswa + 2 dosen). Slot mahasiswa tampil di podium lantai 1,
    // slot dosen di podium lantai 2. null berarti bukan karya unggulan.
    featured_slot: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      validate: {
        isIn: [[1, 2]],
      },
    },
    // Muncul di slideshow beranda (hero). Hanya bisa aktif jika project
    // menjadi karya unggulan (featured_slot terisi). Maks 6 lewat service.
    is_shown_in_slideshow: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { name: "projects_user_id", fields: ["user_id"] },
      { name: "projects_category_id", fields: ["category_id"] },
      { name: "projects_status", fields: ["status"] },
    ],
  },
)

module.exports = Project

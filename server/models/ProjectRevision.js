const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

// Revisi karya yang menunggu verifikasi admin.
//
// Pointanya: tabel `projects` cuma punya SATU baris per karya dengan status
// enum(pending, published, rejected). Kalau edit mahasiswa langsung ditulis ke
// sana, karya yang sudah tayang ikut berubah seketika tanpa ada yang
// memverifikasi — persis bug yang diperbaiki. Karena tidak ada kolom versi
// ganda di `projects`, revisi dipisah ke tabel ini: baris `projects` TIDAK
// disentuh sampai admin menyetujui, jadi karya yang live tetap utuh.
//
// `payload` menyimpan KEADAAN AKHIR yang diminta (bukan diff), sehingga
// approve cukup menulis ulang apa adanya — identik dengan alur updateProject
// yang sudah ada, tanpa perlu logika diff/merge yang rawan.
const ProjectRevision = sequelize.define(
  "ProjectRevision",
  {
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    rejection_reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    approve_note: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    // Admin yang memproses revisi. Disimpan terpisah dari payload supaya
    // riwayat siapa yang menyetujui tidak hilang saat project dihapus.
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "project_revisions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { name: "project_revisions_project_id", fields: ["project_id"] },
      { name: "project_revisions_user_id", fields: ["user_id"] },
      { name: "project_revisions_status", fields: ["status"] },
    ],
  },
)

module.exports = ProjectRevision

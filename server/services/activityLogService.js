const { ActivityLog, User } = require("../models")

// Dipanggil dari controller/service lain. Tidak pernah melempar error agar
// tidak mengganggu alur utama sistem.
exports.logActivity = async ({
  userId = null,
  action,
  targetType = null,
  targetId = null,
  description = null,
}) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      description,
    })
  } catch (err) {
    console.error("Gagal mencatat aktivitas:", err.message)
  }
}

exports.getActivityLogs = async (query = {}) => {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 20
  const offset = (page - 1) * limit

  const { count, rows } = await ActivityLog.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "avatar"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  })

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  }
}

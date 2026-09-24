const { SiteVisit } = require("../models")

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

exports.recordVisit = async (ipAddress) => {
  if (!ipAddress) return null

  const date = todayUtc()
  const existing = await SiteVisit.findOne({
    where: { ip_address: ipAddress, visit_date: date },
  })
  if (existing) return existing

  try {
    return await SiteVisit.create({ ip_address: ipAddress, visit_date: date })
  } catch (err) {
    // Race dengan request paralel dari IP yang sama hari ini — unique index
    // (ip_address, visit_date) sudah menjaga, cukup abaikan duplikat.
    if (err && err.name === "SequelizeUniqueConstraintError") return null
    throw err
  }
}
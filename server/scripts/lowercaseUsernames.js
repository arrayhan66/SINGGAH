require("dotenv").config()
const { Op } = require("sequelize")
const { User } = require("../models")

async function run() {
  const users = await User.findAll({ attributes: ["id", "username"] })
  let changed = 0
  let conflicts = 0

  for (const user of users) {
    const lower = String(user.username || "").trim().toLowerCase()
    if (!lower || lower === user.username) continue

    const clash = await User.findOne({
      where: {
        username: lower,
        id: { [Op.ne]: user.id },
      },
    })

    if (clash) {
      console.log(`SKIP  ${user.username} -> ${lower} (sudah dipakai user lain)`)
      conflicts++
      continue
    }

    user.username = lower
    await user.save()
    console.log(`${user.username} -> ${lower}`)
    changed++
  }

  console.log(`\nSelesai. ${changed} username dinormalisasi, ${conflicts} konflik.`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

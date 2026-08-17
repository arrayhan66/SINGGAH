require("dotenv").config()
const mysql = require("mysql2/promise")

;(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
  const [ver] = await conn.query("SELECT VERSION() as v")
  console.log("MySQL version:", ver[0].v)
  const [b] = await conn.query("SHOW VARIABLES LIKE 'log_bin'")
  console.log("log_bin:", b[0].Value)
  try {
    const [ms] = await conn.query("SHOW MASTER STATUS")
    console.log("MASTER STATUS:", JSON.stringify(ms))
  } catch (e) {
    console.log("SHOW MASTER STATUS error:", e.message)
  }
  try {
    const [files] = await conn.query("SHOW BINARY LOGS")
    console.log("BINARY LOGS:", JSON.stringify(files))
  } catch (e) {
    console.log("SHOW BINARY LOGS error:", e.message)
  }
  const [d] = await conn.query("SELECT @@datadir as d, @@log_bin_basename as b")
  console.log("datadir:", d[0].d, "| basename:", d[0].b)
  await conn.end()
})().catch((e) => {
  console.error("ERR", e.message)
  process.exit(1)
})

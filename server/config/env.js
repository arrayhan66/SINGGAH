const requiredEnv = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
]

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} belum diisi di file .env`)
  }
})

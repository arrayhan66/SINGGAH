const requiredEnv = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
]

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} belum diisi di file .env`)
  }
})

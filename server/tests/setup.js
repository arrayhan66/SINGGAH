process.env.NODE_ENV = "test"
process.env.JWT_SECRET = "test_jwt_secret_key_123456789"

const { sequelize } = require("../models")

beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})

const path = require("path")
const SwaggerParser = require("@apidevtools/swagger-parser")

const swaggerPath = path.join(__dirname, "../docs/openapi.yaml")

async function loadSwagger() {
  return await SwaggerParser.bundle(swaggerPath)
}

module.exports = loadSwagger

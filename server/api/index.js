// mysql2 dimuat Sequelize secara DINAMIS, sehingga bundler serverless Vercel
// tidak ikut membundelnya. Require statis ini memastikan driver DB ikut ter-bundle.
require("mysql2")

// Export app Express langsung (bukan serverless-http): Vercel memanggil fungsi
// dengan gaya HTTP (req, res) seperti handler Node biasa.
const app = require("../server.js")

module.exports = app
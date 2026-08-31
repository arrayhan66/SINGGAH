const { OAuth2Client } = require("google-auth-library")

const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID belum diset di .env")
  }
  return new OAuth2Client(clientId)
}

const verifyGoogleToken = async (idToken) => {
  const client = getGoogleClient()
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  return ticket.getPayload()
}

module.exports = { verifyGoogleToken }

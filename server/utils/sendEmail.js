const nodemailer = require("nodemailer")
const { BRAND_NAME } = require("./emailTemplate")
const logger = require("./logger")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve(true)
  }
  await transporter.sendMail({
    from: `"${BRAND_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  })
}

const sendEmailAsync = (opts) => {
  sendEmail(opts).catch((err) => {
    logger.error("Gagal mengirim email:", err.message)
  })
}

module.exports = sendEmail
module.exports.sendEmailAsync = sendEmailAsync

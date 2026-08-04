const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve(true)
  }
  await transporter.sendMail({
    from: `"PamerIT" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

module.exports = sendEmail

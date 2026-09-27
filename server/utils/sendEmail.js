const { BRAND_NAME } = require("./emailTemplate");
const logger = require("./logger");

const SENDLIB_API_URL = "https://sendlib.samueltuoyo.com/api/send";

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve(true);
  }

  if (!process.env.SENDLIB_API_KEY) {
    throw new Error("SENDLIB_API_KEY belum diset");
  }

  if (!process.env.SENDLIB_FROM_EMAIL) {
    throw new Error("SENDLIB_FROM_EMAIL belum diset");
  }

  const response = await fetch(SENDLIB_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.SENDLIB_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `"${BRAND_NAME}" <${process.env.SENDLIB_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengirim email");
  }

  return result;
};

const sendEmailAsync = (opts) => {
  sendEmail(opts).catch((err) => {
    logger.error("Gagal mengirim email", {
      message: err.message,
      code: err.code,
    });
  });
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;

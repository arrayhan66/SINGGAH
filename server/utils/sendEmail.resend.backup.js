const { Resend } = require("resend");
const { BRAND_NAME } = require("./emailTemplate");
const logger = require("./logger");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve(true);
  }

  const { data, error } = await resend.emails.send({
    from: `${BRAND_NAME} <onboarding@resend.dev>`,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Gagal mengirim email");
  }

  return data;
};

const sendEmailAsync = (opts) => {
  sendEmail(opts).catch((err) => {
    logger.error("Gagal mengirim email", {
      message: err.message,
      code: err.code,
      response: err.response,
      responseCode: err.responseCode,
    });
  });
};

module.exports = sendEmail;
module.exports.sendEmailAsync = sendEmailAsync;

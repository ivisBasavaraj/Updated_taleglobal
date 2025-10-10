const emailjs = require('@emailjs/nodejs');

const buildTemplatePayload = (email, resetUrl) => ({
  service_id: process.env.EMAILJS_SERVICE_ID,
  template_id: process.env.EMAILJS_TEMPLATE_ID,
  user_id: process.env.EMAILJS_PUBLIC_KEY,
  accessToken: process.env.EMAILJS_PRIVATE_KEY,
  template_params: {
    user_email: email,
    reset_link: resetUrl
  }
});

const sendResetEmail = async (email, resetToken, userType) => {
  const basePath = userType === 'employer' ? '/employer' : userType === 'placement' ? '/placement' : '/candidate';
  const resetUrl = `${process.env.FRONTEND_URL}${basePath}/reset-password/${resetToken}`;
  const payload = buildTemplatePayload(email, resetUrl);

  await emailjs.send(payload.service_id, payload.template_id, payload.template_params, {
    publicKey: payload.user_id,
    privateKey: payload.accessToken
  });
};

module.exports = { sendResetEmail };
// utils/sendOtpEmail.js

import nodemailer from "nodemailer";

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.email, // Use env vars in production process.env.email
        pass: process.env.pass, // process.env.pass
      },
    });

    const mailOptions = {
      from: '"Lawvs" <support@lawvs.com>',
      to: email,
      subject: "Your OTP for Password Reset",
      html: `
       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #2c3e50; text-align: center;">OTP Verification</h2>
                <p style="font-size: 16px; color: #555555; text-align: center;">
                Please use the following OTP to complete your password reset:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; background-color: #f0f0f0; color: #2c3e50; padding: 15px 30px; border-radius: 8px;">
                    ${otp}
                </span>
                </div>
                <p style="font-size: 14px; color: #999999; text-align: center;">
                This OTP is valid for <strong>5 minutes</strong>.
                </p>
                <p style="font-size: 13px; color: #aaaaaa; text-align: center; margin-top: 30px;">
                If you didn’t request this, please ignore this email.
                </p>
            </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

export default sendOtpEmail;

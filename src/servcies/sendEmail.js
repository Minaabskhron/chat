//npm i nodemailer  jsonwebtoken
//https://nodemailer.com/
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { emailTemplate } from "./emailTemplate.js";

export const sendEmail = async (user) => {
  try {
    const { email, name } = user;
    const transporter = nodemailer.createTransport({
      // service: "gmail",
      // auth: {
      //   type: "OAuth2",
      //   user: process.env.EMAIL,
      //   clientId: process.env.OAUTH_CLIENTID,
      //   clientSecret: process.env.OAUTH_CLIENT_SECRET,
      //   refreshToken: process.env.OAUTH_REFRESH_TOKEN
      // }
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD, //app passwords mn google account bs lazm ykon 2 verifications
      },
    });

    const token = jwt.sign({ email, name }, process.env.JWT_EMAIL_KEY, {
      expiresIn: "15m",
    });

    user.emailVerificationToken = token;
    user.isEmailVerified = false;
    // user.emailVerificationExpires = Date.now() + 900000;
    await user.save();

    await transporter.sendMail({
      from: `"" ${process.env.EMAIL}`,
      to: user.email,
      subject: "Confirm email",
      html: emailTemplate(token),
    });

    console.log("Message sent:", user.email);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
};
//fe almodel
//isEmailVerified: {
//type: Boolean,
//default: false,},

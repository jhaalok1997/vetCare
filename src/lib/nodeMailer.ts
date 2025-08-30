import nodemailer from "nodemailer";



// Create SMTP transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


 // Email content
   export const mailOptions = (email: string, resetUrl: string) => ({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Vet🐾Care ",
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Vet🐾Care account.</p>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 20px 0;
        ">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Vet🐾Care Team</p>
      `,
    });
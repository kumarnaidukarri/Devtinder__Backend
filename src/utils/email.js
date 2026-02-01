// Email Service using Nodemailer + Gmail SMTP.

const nodemailer = require("nodemailer"); // Nodemailer library for sending Emails.

const transporterInstance = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_GMAIL_USERNAME,
    pass: process.env.SMTP_GMAIL_PASSWORD,
  },
}); // Transporter creates an instance object that handles the connection to the email service SMTP server.

const sendEmail = async (toEmailAddress, userName = "User") => {
  try {
    const emailResponse = await transporterInstance.sendMail({
      from: process.env.SMTP_GMAIL_USERNAME,
      to: toEmailAddress,
      subject: "Thanks for signing up to DevTinder Application 🚀",
      text: `Dear ${userName},

Thanks for signing up for DevTinder!
We’re excited to have you join our developer community.

Start matching and connecting with fellow developers 🚀

Cheers,
DevTinder Team

You’re receiving this email because you signed up for DevTinder.
If you did not create this account, no action is required.
i.e, i randomly/unknowingly typed this email.

This application is a small personal project, so no worries.`,
    });
    console.log("Message sent success: ", emailResponse);
    return emailResponse;
  } catch (err) {
    console.error("custom mail sending error: ", err);
  }
};

const sendEmailToRemindFriendRequests = async (
  toEmailAddress,
  userName = "User",
) => {
  try {
    const emailResponse = await transporterInstance.sendMail({
      from: process.env.SMTP_GMAIL_USERNAME,
      to: toEmailAddress,
      subject: `New Friend Requests are  Pending for ${toEmailAddress}`,
      text: `Dear ${userName},

There are so many Friend Requests Pending. Please login to Devtinder and accept or reject them.
Start matching and connecting with fellow developers 🚀

Cheers,
DevTinder Team

You’re receiving this email because you signed up for DevTinder.
If you did not create this account, no action is required.
i.e, i randomly/unknowingly typed this email. 

This application is a small personal project, so no worries.`,
    });
    console.log("Message sent success: ", emailResponse);
    return emailResponse;
  } catch (err) {
    console.error("custom mail sending error: ", err);
  }
};

module.exports = { sendEmail, sendEmailToRemindFriendRequests };

// Email Templates
// 1.
/*
Sub - "Thanks for signing up to DevTinder Application 🚀"
Body -
`Dear ${userName},

Thanks for signing up for DevTinder!
We’re excited to have you join our developer community.

Start matching and connecting with fellow developers 🚀

Cheers,
DevTinder Team

You’re receiving this email because you signed up for DevTinder.
If you did not create this account, no action is required.

This application is a small personal project, so no worries.`,
*/

// 2.
/*
Sub  - "Signedup to Devtinder Application",
Body - `Hi there ! i hope this email finds you well. 
        i am testing Email service in my Nodejs application which uses Nodemailer + Gmail SMTP Server
        Testing Nodemailer for Sending Mails from Nodejs Application`,
*/

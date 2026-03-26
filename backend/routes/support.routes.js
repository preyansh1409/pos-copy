import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Gmail configuration with App Password
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "preyanshpatel1409@gmail.com",
        pass: "lzbm wgjm yurc tgdo",
    },
});





router.post("/send-support-email", async (req, res) => {
    const { type, daysLeft, username } = req.body;
    const supportPhone = "1000000000";

    let subject = "";
    let emailText = "";

    if (type === "renewal") {
        subject = `Subscription Renewal Request - Prestige Garments (${username})`;
        emailText = `Hello Spick Technology Team,

A subscription renewal request has been received.

ACCOUNT DETAILS:
----------------
Username: ${username}
Days Remaining: ${daysLeft}
Action: Subscription Renewal

Please guide the user through the renewal process.

Regards,
Prestige Garments Management Software`;
    } else {
        subject = `Technical Support Request - Prestige Garments (${username})`;
        emailText = `Hello Spick Technology Team,

A technical support request has been received from a user.

ACCOUNT DETAILS:
----------------
Username: ${username}
Issue Type: Technical Support / Software Help
Action: Support Request

The user is experiencing an issue or has a query regarding the system. Please reach out to them for assistance.

Regards,
Prestige Garments Management Software`;
    }

    const mailOptions = {
        from: "preyanshpatel1409@gmail.com",
        to: "preyanshpatel1409@gmail.com",
        subject: subject,
        text: emailText,
    };

    // We respond immediately to the user so the UI feels instant
    res.status(200).json({ message: "Your request has been initiated!" });

    // Send the email in the background
    transporter.sendMail(mailOptions).then(() => {
        console.log(`✅ ${type} email sent successfully`);
    }).catch((error) => {
        console.error(`❌ Background Email Error (${type}):`, error);
    });
});

export default router;

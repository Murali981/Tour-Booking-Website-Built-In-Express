const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // We have to follow three steps to send email using nodemailer
  // Step 1: Create a transporter
  /* Transporter is the service which actually sends the email because it is not the node.js that will actually send 
   the email itself */

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate the "less secure app" option in your gmail account
    /* Right now we gonna do is , We will use a special development service which basically fakes to send emails to real
     addresses But in reality , these emails end up trapped in a development inbox so that we can take a  look at how
     they will look later in production and this service is called Mail Trap */
  });

  // Step 2: Define the email options

  const mailOptions = {
    from: "Nishaank J <nishaank.self@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // Step 3: Actually send the email with the nodemailer.

  await transporter.sendMail(mailOptions); // this will actually return a promise , So to resolve the promise we will await it
};

module.exports = sendEmail;

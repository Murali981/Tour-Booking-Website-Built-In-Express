const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

// new Email(user,url).sendWelcome()
module.exports = class Email {
  // We have created this email class from which we can create email objects that we can use to send actual emails and to create a new
  // email object we will pass in the user and the URL that we want to be in that email and we will assign all the below stuff to
  // the newly created email object which is in the below constructor function
  constructor(user, url) {
    // This constructor function will run whenever a new object is created in the class
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Murali J <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // We have this new transport() function for creating different transports for different environments
    // We want to have different transports when we are in production (or) in development environment (or) not
    // When we are in production , we want to send real emails which we will use sendGrid for sending the real emails and if we are
    // not in production then we want to still use mailtrap for sending the emails
    // if (process.env.NODE_ENV === "production") {
    //   // Send real emails using SendGrid
    //   return nodemailer.createTransport({
    //     service: "SendGrid", // For the nodemailer this SendGrid service is predefined and this is the reason we didn't specify the
    //     // HOST and PORT number for using this SendGrid service because nodemailer already knows the data about the HOST and PORT number
    //     // because we are specifying the service as "SendGrid"
    //     auth: {
    //       user: process.env.SENDGRID_USERNAME,
    //       pass: process.env.SENDGRID_PASSWORD,
    //     },
    //   });
    // }

    // return nodemailer.createTransport({
    //   // When we are in developer environment
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    //   // Activate the "less secure app" option in your gmail account
    //   /* Right now we gonna do is , We will use a special development service which basically fakes to send emails to real
    //    addresses But in reality , these emails end up trapped in a development inbox so that we can take a  look at how
    //    they will look later in production and this service is called Mail Trap */
    // });

    // Use SendGrid for both development and production
    return nodemailer.createTransport({
      service: "SendGrid", // Use SendGrid for sending emails
      auth: {
        user: process.env.SENDGRID_USERNAME, // For SendGrid, the username should be "apikey"
        pass: process.env.SENDGRID_PASSWORD, // This is the SendGrid API key
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // Step 1 : Render the HTML based on the pug template
    /* Until this point we only used the pug to  create a template and then we pass the name of the template into the render function on 
    the response which is res.render("template-name") => and what does this render function does behind the scenes is to basically create
    the HTML based on the pug template and then send it to the client. Now in this case of sending emails we donot really want to render
    but all we want to do is create the HTML out of the template so that we can send that HTML as the email as we will define the 
    HTML options in the below mailOptions and mainly we are interested in  sending an HTML email and this is the reason we will have a
    PUG template from which we will generate this HTML   */

    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    }); // This render() function will take the file and then render the pug code into the
    // real HTML and this we are saving into the "html" variable and here "${__dirname}" refers to the current directory which is the
    // utils folder and from the utils folder we need to move one step up by writing "../views" by going into the views folder and from the
    // views go into the emails folder and inside this emails folder we will have the email template file

    // Step 2: Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // html:
    };

    // Step 3 : Create a transport and send the email
    await this.newTransport().sendMail(mailOptions); // this will actually return a promise , So to resolve the promise we will await it;
  } // This send function will do the actual sending of the emails. This send function will recieve a template and a
  // subject

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the Natours family"); // This send function will recieve a pug template and a subject as arguments
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token is (valid for only 10 minutes)",
    ); // This send function will recieve a pug template which is "passwordReset" which we have
    // created in the path "views/email/passwordReset.pug" and a subject as arguments
  }
};

// const sendEmail = async (options) => {
//   // We have to follow three steps to send email using nodemailer
//   // Step 1: Create a transporter
//   /* Transporter is the service which actually sends the email because it is not the node.js that will actually send
//    the email itself */
//   // Step 2: Define the email options
//   // Step 3: Actually send the email with the nodemailer.
// };

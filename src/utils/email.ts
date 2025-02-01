import { createTransport, Transporter } from "nodemailer";
import { config } from "../config";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      // Gmail requires secure: true when using port 465, false when using 587
      secure: false, // Set to false for port 587
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      // Verify connection before sending
      await this.transporter.verify();
      
      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send verification email. Please try again later.");
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const emailService = new EmailService();
export const sendEmail = emailService.sendEmail.bind(emailService);

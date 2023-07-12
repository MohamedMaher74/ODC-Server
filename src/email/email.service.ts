import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: any,
    attachments: any,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'backendodc@gmail.com',
      to,
      subject,
      html,
      attachments: attachments,
    };

    await this.transporter.sendMail(
      mailOptions,
      function (err: any, info: any) {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Email Sent: ' + info.response);
      },
    );
  }
}

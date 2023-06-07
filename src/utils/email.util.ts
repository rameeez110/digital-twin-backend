import { createTransport } from 'nodemailer';
import {
  EMAIL_USER,
  EMAIL_PASSWORD,
  FROM_EMAIL,
} from '@config';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export async function sendEmail(mailOptions: any) {
  return new Promise((resolve, reject) => {
    mailOptions.from = FROM_EMAIL;
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return reject(error);
      return resolve(info);
    });
  });
}

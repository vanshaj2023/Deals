"use server"

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
): Promise<EmailContent> {
  const short = product.title.length > 20
    ? `${product.title.substring(0, 20)}...`
    : product.title;

  let subject = '';
  let body = '';

  switch (type) {
    case 'WELCOME':
      subject = `You're now tracking ${short}`;
      body = `
        <div>
          <h2>You're tracking ${product.title}</h2>
          <p>We'll alert you when the price drops to your target.</p>
          <p><a href="${product.url}" target="_blank">View product</a></p>
        </div>
      `;
      break;

    case 'TARGET_PRICE_MET':
      subject = `Price drop alert: ${short} hit your target!`;
      body = `
        <div>
          <h2>${product.title} is at or below your target price!</h2>
          <p>Head over and grab it now: <a href="${product.url}" target="_blank">Buy now</a></p>
        </div>
      `;
      break;

    case 'LOWEST_PRICE':
      subject = `Lowest price ever: ${short}`;
      body = `
        <div>
          <h2>${product.title} has hit its lowest price ever!</h2>
          <p><a href="${product.url}" target="_blank">Buy now</a></p>
        </div>
      `;
      break;

    case 'CHANGE_OF_STOCK':
      subject = `${short} is back in stock!`;
      body = `
        <div>
          <h2>${product.title} is back in stock!</h2>
          <p><a href="${product.url}" target="_blank">Buy now</a></p>
        </div>
      `;
      break;

    case 'THRESHOLD_MET':
      subject = `Big discount on ${short}`;
      body = `
        <div>
          <h2>${product.title} has a significant discount!</h2>
          <p><a href="${product.url}" target="_blank">Buy now</a></p>
        </div>
      `;
      break;

    default:
      throw new Error('Invalid notification type');
  }

  return { subject, body };
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: sendTo,
    html: emailContent.body,
    subject: emailContent.subject,
  });
};

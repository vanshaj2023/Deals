import { generateEmailBody, sendEmail } from '@/lib/nodemailer';
import { EmailProductInfo, NotificationType } from '@/types';

export async function sendEmailAlert(
  to: string,
  product: EmailProductInfo,
  type: NotificationType
) {
  const content = await generateEmailBody(product, type);
  await sendEmail(content, [to]);
}

import { sendEmail } from '@/lib/email/send';
import { MessageNotification } from '@/lib/email/templates/message-notification';
import { siteConfig } from '@/lib/site-config';

interface SendMessageNotificationInput {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  propertyTitle: string;
  messagePreview: string;
  threadId: string;
}

/**
 * Sends a new message notification email to the recipient.
 *
 * Called when a message is sent in a thread. The email includes
 * a preview of the message and a link back to the thread on tsumugi.
 */
export async function sendMessageNotification({
  recipientEmail,
  recipientName,
  senderName,
  propertyTitle,
  messagePreview,
  threadId,
}: SendMessageNotificationInput) {
  const threadUrl = `${siteConfig.url}/messages/${threadId}`;

  return sendEmail({
    to: recipientEmail,
    subject: `【tsumugi】${senderName}さんから新着メッセージが届きました`,
    react: MessageNotification({
      recipientName,
      senderName,
      propertyTitle,
      messagePreview,
      threadUrl,
    }),
  });
}

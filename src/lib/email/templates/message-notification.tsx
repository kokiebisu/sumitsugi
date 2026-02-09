import { Button, Heading, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

const MESSAGE_PREVIEW_MAX_LENGTH = 200;

interface MessageNotificationProps {
  recipientName: string;
  senderName: string;
  propertyTitle: string;
  messagePreview: string;
  threadUrl: string;
}

function truncatePreview(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * 新着メッセージ通知（相手方へ送信）
 */
export function MessageNotification({
  recipientName,
  senderName,
  propertyTitle,
  messagePreview,
  threadUrl,
}: MessageNotificationProps) {
  const preview = truncatePreview(messagePreview, MESSAGE_PREVIEW_MAX_LENGTH);

  return (
    <BaseLayout preview={`${senderName}さんから新着メッセージが届きました`}>
      <Heading as="h2" style={styles.heading}>
        新着メッセージが届きました
      </Heading>

      <Text style={styles.text}>{recipientName} 様</Text>

      <Text style={styles.text}>
        物件「{propertyTitle}」に関して、{senderName}
        さんからメッセージが届きました。
      </Text>

      <Text style={styles.label}>メッセージ:</Text>
      <Text style={styles.messageBox}>{preview}</Text>

      <Button href={threadUrl} style={styles.button}>
        メッセージを確認する
      </Button>

      <Text style={styles.note}>
        ※ このメールはtsumugiのメッセージ機能から自動送信されました。
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: {
    color: '#333333',
    fontSize: '20px',
    fontWeight: '600' as const,
    margin: '0 0 16px',
  },
  text: {
    color: '#555555',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 12px',
  },
  label: {
    color: '#888888',
    fontSize: '12px',
    margin: '16px 0 4px',
    textTransform: 'uppercase' as const,
  },
  messageBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    color: '#555555',
    fontSize: '14px',
    lineHeight: '22px',
    margin: '0 0 16px',
    padding: '12px 16px',
    whiteSpace: 'pre-wrap' as const,
  },
  button: {
    backgroundColor: '#FF5A5F',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '16px 0',
    padding: '12px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
  note: {
    color: '#999999',
    fontSize: '12px',
    margin: '16px 0 0',
  },
};

MessageNotification.PreviewProps = {
  recipientName: '田中太郎',
  senderName: '山田花子',
  propertyTitle: '渋谷区神宮前 1LDK｜北欧スタイルのワンルーム',
  messagePreview:
    'こんにちは、内見の件でご連絡しました。来週の土曜日はご都合いかがでしょうか？',
  threadUrl: 'https://tsumugi.com/messages/thread-1',
} satisfies MessageNotificationProps;

import { Button, Heading, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface ViewingScheduledProps {
  recipientName: string;
  otherPartyName: string;
  propertyTitle: string;
  viewingDate: string;
  propertyUrl: string;
}

/**
 * 内見確定通知（双方へ送信）
 */
export function ViewingScheduled({
  recipientName,
  otherPartyName,
  propertyTitle,
  viewingDate,
  propertyUrl,
}: ViewingScheduledProps) {
  return (
    <BaseLayout preview={`${propertyTitle}の内見日程が確定しました`}>
      <Heading as="h2" style={styles.heading}>
        内見日程が確定しました
      </Heading>

      <Text style={styles.text}>{recipientName} 様</Text>

      <Text style={styles.text}>
        以下の物件の内見日程が確定しました。当日はお気をつけてお越しください。
      </Text>

      <Text style={styles.detail}>
        <strong>物件:</strong> {propertyTitle}
      </Text>
      <Text style={styles.detail}>
        <strong>日時:</strong> {viewingDate}
      </Text>
      <Text style={styles.detail}>
        <strong>相手:</strong> {otherPartyName}
      </Text>

      <Button href={propertyUrl} style={styles.button}>
        物件詳細を見る
      </Button>

      <Text style={styles.note}>
        ※
        日程の変更が必要な場合は、ダッシュボードのメッセージ機能でご連絡ください。
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
  detail: {
    backgroundColor: '#f9f9f9',
    borderLeft: '3px solid #FF5A5F',
    color: '#333333',
    fontSize: '14px',
    margin: '8px 0',
    padding: '10px 16px',
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

ViewingScheduled.PreviewProps = {
  recipientName: '田中太郎',
  otherPartyName: '山田花子',
  propertyTitle: '世田谷区の家具付き物件',
  viewingDate: '2026年2月15日（日）10:00',
  propertyUrl: 'https://sumitsugi.jp/listings/1',
} satisfies ViewingScheduledProps;

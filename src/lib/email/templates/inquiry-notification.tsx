import { Button, Heading, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface InquiryNotificationProps {
  sellerName: string;
  buyerName: string;
  propertyTitle: string;
  dashboardUrl: string;
  message?: string;
}

/**
 * F-204: 問い合わせ受付通知（前の住人へ自動送信）
 */
export function InquiryNotification({
  sellerName,
  buyerName,
  propertyTitle,
  dashboardUrl,
  message,
}: InquiryNotificationProps) {
  return (
    <BaseLayout preview={`${propertyTitle}に問い合わせが届きました`}>
      <Heading as="h2" style={styles.heading}>
        問い合わせが届きました
      </Heading>

      <Text style={styles.text}>{sellerName} 様</Text>

      <Text style={styles.text}>
        あなたの物件「{propertyTitle}
        」に次の住人候補から問い合わせが届きました。
      </Text>

      <Text style={styles.detail}>
        <strong>次の住人候補:</strong> {buyerName}
      </Text>

      {message && (
        <>
          <Text style={styles.label}>メッセージ:</Text>
          <Text style={styles.messageBox}>{message}</Text>
        </>
      )}

      <Button href={dashboardUrl} style={styles.button}>
        ダッシュボードで確認する
      </Button>

      <Text style={styles.note}>
        ※ 48時間以内にご返信いただくことをお勧めします。
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
    margin: '16px 0',
    padding: '12px 16px',
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

InquiryNotification.PreviewProps = {
  sellerName: '田中太郎',
  buyerName: '山田花子',
  propertyTitle: '渋谷区神宮前 1LDK｜北欧スタイルのワンルーム',
  dashboardUrl: 'https://tsumugi.com/dashboard',
  message: 'こちらの物件に興味があります。内見は可能でしょうか？',
} satisfies InquiryNotificationProps;

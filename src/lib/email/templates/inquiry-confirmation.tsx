import { Button, Heading, Link, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface InquiryConfirmationProps {
  buyerName: string;
  propertyTitle: string;
  propertyUrl: string;
  message?: string;
}

export function InquiryConfirmation({
  buyerName,
  propertyTitle,
  propertyUrl,
  message,
}: InquiryConfirmationProps) {
  return (
    <BaseLayout preview={`${propertyTitle}への問い合わせを受け付けました`}>
      <Heading as="h2" style={styles.heading}>
        問い合わせを受け付けました
      </Heading>

      <Text style={styles.text}>{buyerName} 様</Text>

      <Text style={styles.text}>
        以下の物件への問い合わせを受け付けました。前の住人からの返信をお待ちください。
      </Text>

      <Text style={styles.propertyTitle}>
        <Link href={propertyUrl} style={styles.link}>
          {propertyTitle}
        </Link>
      </Text>

      {message && (
        <>
          <Text style={styles.label}>送信メッセージ:</Text>
          <Text style={styles.messageBox}>{message}</Text>
        </>
      )}

      <Button href={propertyUrl} style={styles.button}>
        物件を見る
      </Button>

      <Text style={styles.note}>
        ※ 前の住人からの返信は通常1〜3日以内に届きます。
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
  propertyTitle: {
    backgroundColor: '#f9f9f9',
    borderLeft: '3px solid #FF5A5F',
    color: '#333333',
    fontSize: '15px',
    fontWeight: '500' as const,
    margin: '16px 0',
    padding: '12px 16px',
  },
  link: {
    color: '#FF5A5F',
    textDecoration: 'none',
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

InquiryConfirmation.PreviewProps = {
  buyerName: '山田太郎',
  propertyTitle: '渋谷区神宮前 1LDK｜北欧スタイルのワンルーム',
  propertyUrl: 'https://tsumugi.com/properties/example-1',
  message: 'こちらの物件に興味があります。内見は可能でしょうか？',
} satisfies InquiryConfirmationProps;

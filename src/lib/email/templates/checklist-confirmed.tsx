import { Button, Heading, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface ChecklistConfirmedProps {
  recipientName: string;
  propertyTitle: string;
  keepCount: number;
  takeAwayCount: number;
  dashboardUrl: string;
}

/**
 * 家具リスト確定通知（双方へ送信）
 */
export function ChecklistConfirmed({
  recipientName,
  propertyTitle,
  keepCount,
  takeAwayCount,
  dashboardUrl,
}: ChecklistConfirmedProps) {
  return (
    <BaseLayout preview={`${propertyTitle}の引き継ぎリストが確定しました`}>
      <Heading as="h2" style={styles.heading}>
        引き継ぎリストが確定しました
      </Heading>

      <Text style={styles.text}>{recipientName} 様</Text>

      <Text style={styles.text}>
        「{propertyTitle}」の家具引き継ぎリストが確定しました。
      </Text>

      <Text style={styles.detail}>
        <strong>引き継ぎ品目:</strong> {keepCount}点
      </Text>
      <Text style={styles.detail}>
        <strong>引き取らない品目:</strong> {takeAwayCount}点
      </Text>

      <Text style={styles.text}>
        次のステップとして、引き継ぎ合意書の確認・署名に進みます。
      </Text>

      <Button href={dashboardUrl} style={styles.button}>
        ダッシュボードで確認する
      </Button>

      <Text style={styles.note}>
        ※
        内容に疑問がある場合は、ダッシュボードのメッセージ機能でご連絡ください。
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

ChecklistConfirmed.PreviewProps = {
  recipientName: '山田花子',
  propertyTitle: '世田谷区の家具付き物件',
  keepCount: 3,
  takeAwayCount: 1,
  dashboardUrl: 'https://sumitsugi.jp/dashboard',
} satisfies ChecklistConfirmedProps;

import { Button, Heading, Hr, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface MoveOutOneMonthProps {
  hostName: string;
  propertyTitle: string;
  moveOutDate: string;
  daysRemaining: number;
  dashboardUrl: string;
  disposalGuideUrl: string;
}

/**
 * F-504: 退去日1ヶ月前通知
 *
 * 「処分も並行して検討を」の正直なメッセージ。
 * ユーザーに希望を持たせすぎず、現実的な選択肢を提示する。
 */
export function MoveOutOneMonthNotification({
  hostName,
  propertyTitle,
  moveOutDate,
  daysRemaining,
  dashboardUrl,
  disposalGuideUrl,
}: MoveOutOneMonthProps) {
  return (
    <BaseLayout
      preview={`「${propertyTitle}」の退去日まであと${daysRemaining}日です`}
    >
      <Heading as="h2" style={styles.heading}>
        退去日まであと{daysRemaining}日です
      </Heading>

      <Text style={styles.text}>{hostName} 様</Text>

      <Text style={styles.text}>
        「{propertyTitle}」の退去日（{moveOutDate}）まで残り約{daysRemaining}
        日となりました。
      </Text>

      <Hr style={styles.hr} />

      <Heading as="h3" style={styles.subheading}>
        正直にお伝えします
      </Heading>

      <Text style={styles.text}>
        退去日まで1ヶ月を切ると、引き継ぎが成立する可能性は低くなります。
        引き継ぎの成立を目指しつつも、
        <strong>並行して以下の準備を始めることをおすすめします。</strong>
      </Text>

      <Text style={styles.optionTitle}>📦 今できること</Text>

      <Text style={styles.option}>
        <strong>1. 引き継ぎ費用の見直し</strong>
        {'\n'}
        価格を下げることで、マッチングの可能性が上がります。
        ダッシュボードから価格を変更できます。
      </Text>

      <Text style={styles.option}>
        <strong>2. 処分・引き取りの準備</strong>
        {'\n'}
        万が一に備えて、家具・家電の処分方法を確認しておきましょう。
        自治体の粗大ごみ回収や、民間の引き取りサービスが利用できます。
      </Text>

      <Text style={styles.option}>
        <strong>3. 友人・知人への声がけ</strong>
        {'\n'}
        SNSや知り合いに声をかけてみるのも有効な方法です。
      </Text>

      <Hr style={styles.hr} />

      <Button href={dashboardUrl} style={styles.primaryButton}>
        ダッシュボードで価格を見直す
      </Button>

      <Button href={disposalGuideUrl} style={styles.secondaryButton}>
        処分・引き取りガイドを見る
      </Button>

      <Hr style={styles.hr} />

      <Text style={styles.note}>
        引き継ぎが成立した場合、このメール以降の通知は自動的に停止します。
        ご不明な点がございましたら、サポートまでお気軽にお問い合わせください。
      </Text>

      <Text style={styles.footer}>
        ※ この通知は退去日が設定されている物件のホストに自動送信されています。
        通知設定はダッシュボードから変更できます。
      </Text>
    </BaseLayout>
  );
}

const styles = {
  heading: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  subheading: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: '12px',
    marginTop: '8px',
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333333',
    marginBottom: '12px',
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    marginBottom: '8px',
    marginTop: '16px',
  },
  option: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#333333',
    marginBottom: '12px',
    paddingLeft: '16px',
    borderLeft: '3px solid #e5e5e5',
    whiteSpace: 'pre-line' as const,
  },
  hr: {
    borderColor: '#e5e5e5',
    margin: '24px 0',
  },
  primaryButton: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    display: 'inline-block' as const,
    marginBottom: '12px',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    display: 'inline-block' as const,
    border: '2px solid #1a1a1a',
    marginLeft: '8px',
  },
  note: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#666666',
    marginBottom: '8px',
  },
  footer: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#999999',
    marginTop: '16px',
  },
};

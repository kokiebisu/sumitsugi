import { Button, Heading, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface ManagementCompanyAgreementProps {
  managementCompanyName: string;
  propertyAddress: string;
  sellerName: string;
  pdfDownloadUrl: string;
  roomNumber?: string;
}

/**
 * 管理会社向け残置物同意書送付メール
 * Sent to management company when agreement is signed.
 */
export function ManagementCompanyAgreement({
  managementCompanyName,
  propertyAddress,
  sellerName,
  pdfDownloadUrl,
  roomNumber,
}: ManagementCompanyAgreementProps) {
  const fullAddress = roomNumber
    ? `${propertyAddress} ${roomNumber}`
    : propertyAddress;

  return (
    <BaseLayout preview={`${fullAddress}の残置物同意書をお送りします`}>
      <Heading as="h2" style={styles.heading}>
        残置物同意書のご送付
      </Heading>

      <Text style={styles.text}>{managementCompanyName} 御中</Text>

      <Text style={styles.text}>
        いつもお世話になっております。sumitsugiをご利用いただきありがとうございます。
      </Text>

      <Text style={styles.text}>
        下記物件の退去にあたり、残置物に関する同意書をお送りいたします。
        次の入居者への家具引き継ぎについて、クリーニング業者様への共有をお願いいたします。
      </Text>

      <Text style={styles.detail}>
        <strong>物件:</strong> {fullAddress}
      </Text>
      <Text style={styles.detail}>
        <strong>退去者:</strong> {sellerName} 様
      </Text>

      <Text style={styles.text}>
        同意書（PDF）は下記ボタンよりダウンロードいただけます。
      </Text>

      <Button href={pdfDownloadUrl} style={styles.button}>
        同意書PDFをダウンロード
      </Button>

      <Text style={styles.note}>
        ※ 本メールはsumitsugiプラットフォームより自動送信されております。
        ご不明点がございましたら、sumitsugiサポートまでお問い合わせください。
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

ManagementCompanyAgreement.PreviewProps = {
  managementCompanyName: '株式会社ABC管理',
  propertyAddress: '東京都世田谷区三軒茶屋1-1-1',
  sellerName: '田中太郎',
  pdfDownloadUrl: 'https://sumitsugi.jp/api/pdf/agreement-123',
  roomNumber: '301号室',
} satisfies ManagementCompanyAgreementProps;

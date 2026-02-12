import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans JP',
    fontSize: 10,
    padding: '36 44',
    color: '#333333',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 16,
    borderBottom: '2 solid #333333',
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 14,
    fontWeight: 700,
    color: '#FF5A5F',
  },
  docId: {
    fontSize: 8,
    color: '#999999',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
  },
  qaBlock: {
    marginBottom: 12,
    borderLeft: '3 solid #FF5A5F',
    paddingLeft: 10,
  },
  question: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    color: '#333333',
  },
  answer: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.6,
  },
  sectionDivider: {
    borderBottom: '1 solid #eeeeee',
    marginBottom: 12,
  },
  contactBlock: {
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    padding: '10 12',
    borderRadius: 4,
  },
  contactTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 44,
    right: 44,
    borderTop: '1 solid #eeeeee',
    paddingTop: 6,
    fontSize: 7,
    color: '#999999',
    textAlign: 'center',
  },
});

interface FaqItem {
  question: string;
  answer: string;
}

interface ManagementFaqProps {
  createdDate: string;
  contactEmail?: string;
  faqItems?: FaqItem[];
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Q. sumitsugiとは何ですか？',
    answer:
      '前の住人の家具・インテリアを次の住人に引き継ぐプラットフォームです。退去時の廃棄コスト削減と、入居者の初期費用軽減を実現します。',
  },
  {
    question: 'Q. 管理会社の業務は増えますか？',
    answer:
      'いいえ。管理会社様にお願いするのは、sumitsugiから送付する資料をオーナー様に転送いただき、承認結果をお知らせいただくだけです。家具リスト作成、写真撮影、日程調整などの実務はすべてsumitsugiが対応します。',
  },
  {
    question: 'Q. トラブルが起きた場合の責任分担は？',
    answer:
      '引き継ぎ家具に関するトラブル（故障、状態の相違など）はsumitsugiが対応します。物件自体に関するトラブル（設備故障、契約関連など）は従来どおり管理会社様の管轄です。',
  },
  {
    question: 'Q. オーナーにはどう説明すればよいですか？',
    answer:
      'sumitsugiが用意する「相談資料」をオーナー様に転送するだけで大丈夫です。資料には、サービス概要、引き継ぎ家具リスト、メリットがまとめられています。',
  },
  {
    question: 'Q. 入居者から質問されたら？',
    answer:
      '「sumitsugiというサービスで前の住人の家具を引き継げます」とご案内ください。詳しい説明や手続きはsumitsugiが直接対応いたします。',
  },
  {
    question: 'Q. 費用はかかりますか？',
    answer:
      '管理会社様の費用負担はありません。成約時に紹介フィーをお支払いしますので、新しい収益機会としてご活用いただけます。',
  },
];

export function ManagementFaq({
  createdDate,
  contactEmail = 'support@sumitsugi.jp',
  faqItems = DEFAULT_FAQ_ITEMS,
}: ManagementFaqProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>sumitsugi</Text>
          <Text style={styles.docId}>作成日: {createdDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>管理会社様向け FAQ</Text>
        <Text style={styles.subtitle}>
          sumitsugiサービスに関するよくあるご質問と回答
        </Text>

        {/* FAQ Items */}
        {faqItems.map((item, index) => (
          <View key={index}>
            <View style={styles.qaBlock}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
            {index < faqItems.length - 1 && (
              <View style={styles.sectionDivider} />
            )}
          </View>
        ))}

        {/* Contact */}
        <View style={styles.contactBlock}>
          <Text style={styles.contactTitle}>お問い合わせ</Text>
          <Text style={styles.contactText}>
            ご不明点やご相談がございましたら、お気軽にお問い合わせください。
          </Text>
          <Text style={styles.contactText}>メール: {contactEmail}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            sumitsugi 管理会社様向けFAQ | © {new Date().getFullYear()} sumitsugi
          </Text>
        </View>
      </Page>
    </Document>
  );
}

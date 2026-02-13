import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans JP',
    fontSize: 9.5,
    padding: '32 40',
    color: '#333333',
    lineHeight: 1.55,
  },
  header: {
    marginBottom: 14,
    borderBottom: '2 solid #333333',
    paddingBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 13,
    fontWeight: 700,
    color: '#FF5A5F',
  },
  docId: {
    fontSize: 7.5,
    color: '#999999',
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333333',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: '#FF5A5F',
    borderBottom: '1 solid #FF5A5F',
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  bulletList: {
    marginLeft: 12,
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.6,
    marginBottom: 4,
    flexDirection: 'row',
  },
  bulletMarker: {
    width: 12,
    color: '#FF5A5F',
  },
  bulletText: {
    flex: 1,
  },
  highlightBox: {
    backgroundColor: '#FFFAF9',
    padding: '8 10',
    borderLeft: '3 solid #FF5A5F',
    marginBottom: 10,
  },
  highlightText: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.5,
    fontWeight: 700,
  },
  divisionBox: {
    backgroundColor: '#F5F5F5',
    padding: '8 10',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 3,
  },
  divisionTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 5,
    color: '#333333',
  },
  divisionItem: {
    fontSize: 8.5,
    color: '#555555',
    lineHeight: 1.5,
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTop: '1 solid #eeeeee',
    paddingTop: 5,
    fontSize: 7,
    color: '#999999',
    textAlign: 'center',
  },
});

interface AgencyExplainerProps {
  createdDate: string;
  contactEmail?: string;
  contactPhone?: string;
}

export function AgencyExplainer({
  createdDate,
  contactEmail = 'hello@sumitsugi.jp',
  contactPhone = '',
}: AgencyExplainerProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>sumitsugi</Text>
          <Text style={styles.docId}>作成日: {createdDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>仲介会社様向けご案内</Text>

        {/* Section 1: What is sumitsugi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>sumitsugiとは</Text>
          <Text style={styles.paragraph}>
            sumitsugiは、退去する住人の家具・インテリアを次の入居者にそのまま引き継ぐプラットフォームです。家具付きですぐ住める物件を提供することで、入居者の初期費用を大幅に削減し、成約率の向上をサポートします。
          </Text>
        </View>

        {/* Section 2: Benefits for agencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>仲介会社様の3つのメリット</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletMarker}>●</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: 700 }}>成約数UP：</Text>
                家具付き即入居可能物件は、外国人・転勤者・若年層に高い需要があります。SUUMO・HOME'Sにはない差別化ポイントとして、御社の成約率向上に貢献します。
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletMarker}>●</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: 700 }}>初期費用の削減：</Text>
                家具購入費30〜50万円が不要になるため、お客様の初期費用負担が大幅に軽減されます。内見時にも完成された空間を見せられるため、成約につながりやすくなります。
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletMarker}>●</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: 700 }}>新規客層の獲得：</Text>
                外国人（年間30万人が来日）、短期転勤者、20代単身者など、家具付き物件を求める層にリーチできます。
              </Text>
            </View>
          </View>
        </View>

        {/* Highlight box */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            御社の業務フローは変わりません。賃貸契約は従来通り御社が仲介します。
          </Text>
        </View>

        {/* Section 3: Division of roles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>役割分担</Text>
          <View style={styles.divisionBox}>
            <Text style={styles.divisionTitle}>
              【家具の引き継ぎ】sumitsugiが担当
            </Text>
            <Text style={styles.divisionItem}>
              ・家具リスト作成、写真撮影、内見調整
            </Text>
            <Text style={styles.divisionItem}>
              ・引き継ぎ同意書の締結、決済処理
            </Text>
            <Text style={styles.divisionItem}>・家具に関するトラブル対応</Text>
          </View>
          <View style={styles.divisionBox}>
            <Text style={styles.divisionTitle}>
              【賃貸契約】仲介会社様が担当（従来通り）
            </Text>
            <Text style={styles.divisionItem}>
              ・物件紹介、内見調整、重要事項説明
            </Text>
            <Text style={styles.divisionItem}>・賃貸借契約書の作成と締結</Text>
            <Text style={styles.divisionItem}>・鍵の引き渡し、仲介手数料</Text>
          </View>
          <Text style={styles.paragraph}>
            家具の引き継ぎはsumitsugiが管理し、賃貸契約は御社が仲介します。お互いの専門領域で協力し合う補完関係です。
          </Text>
        </View>

        {/* Section 4: Property list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>物件リストの提供について</Text>
          <Text style={styles.paragraph}>
            sumitsugiからエリア内の引き継ぎ可能物件リストをお渡しします。御社のラインナップに「家具付き即入居OK」物件として追加していただけます。お客様への紹介トーク例や説明資料も併せてご提供しますので、すぐにご活用いただけます。
          </Text>
        </View>

        {/* Contact section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>お問い合わせ</Text>
          <Text style={styles.paragraph}>
            ご不明点やご相談がございましたら、お気軽にお問い合わせください。
          </Text>
          <Text style={styles.paragraph}>
            メール: {contactEmail}
            {contactPhone && ` / 電話: ${contactPhone}`}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            sumitsugi 仲介会社様向けご案内 | © {new Date().getFullYear()}{' '}
            sumitsugi
          </Text>
        </View>
      </Page>
    </Document>
  );
}

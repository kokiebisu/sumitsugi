import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans JP',
    fontSize: 10,
    padding: '36 44',
    color: '#333333',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #FF5A5F',
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: '#FF5A5F',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 9,
    color: '#666666',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#FF5A5F',
    marginBottom: 8,
    borderBottom: '1 solid #eeeeee',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  label: {
    width: 120,
    fontSize: 9,
    color: '#666666',
    fontWeight: 700,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #dddddd',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eeeeee',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableColName: {
    width: '40%',
    fontSize: 9,
  },
  tableColCategory: {
    width: '20%',
    fontSize: 9,
  },
  tableColDesc: {
    width: '40%',
    fontSize: 9,
    color: '#666666',
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: '#666666',
    textTransform: 'uppercase',
  },
  stepBox: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF5A5F',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
    paddingTop: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 9,
    color: '#555555',
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderLeft: '3 solid #FF5A5F',
    padding: '10 14',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 44,
    right: 44,
    borderTop: '1 solid #eeeeee',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#999999',
  },
  footerLink: {
    fontSize: 7,
    color: '#FF5A5F',
    textDecoration: 'none',
  },
});

interface FurnitureItem {
  name: string;
  category: string;
  description?: string;
}

interface ConsultationDocumentProps {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: FurnitureItem[];
  createdDate: string;
}

export function ConsultationDocument({
  propertyName,
  propertyAddress,
  moveOutDate,
  sellerName,
  furnitureItems,
  createdDate,
}: ConsultationDocumentProps) {
  const actionSteps = [
    {
      title: '内容のご確認',
      desc: '本資料に記載の家具リストと引き継ぎの仕組みをご確認ください。',
    },
    {
      title: 'オーナー様への転送',
      desc: '必要に応じて物件オーナー（大家）様へ本資料を転送してください。',
    },
    {
      title: '承認結果のご連絡',
      desc: '承認・条件付き承認・不承認のいずれかを前の住人へお伝えください。',
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>tsumugi</Text>
          <Text style={styles.headerDate}>作成日: {createdDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>残置物引き継ぎのご相談</Text>

        {/* Property Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>物件情報</Text>
          <View style={styles.row}>
            <Text style={styles.label}>物件名</Text>
            <Text style={styles.value}>{propertyName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>所在地</Text>
            <Text style={styles.value}>{propertyAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>退去予定日</Text>
            <Text style={styles.value}>{moveOutDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>前の住人</Text>
            <Text style={styles.value}>{sellerName}</Text>
          </View>
        </View>

        {/* What is tsumugi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tsumugiとは</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              tsumugiは、前の住人が大切に使ってきた家具・インテリアを次の住人へ引き継ぐためのサービスです。
              処分ではなく「引き継ぎ」という形で、環境に配慮しながら前の住人の負担を軽減します。
              次の住人候補は、tsumugiのプラットフォームを通じてマッチングされ、
              内見後に引き継ぎの合意が成立します。
            </Text>
          </View>
        </View>

        {/* Furniture List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            暫定家具リスト（{furnitureItems.length}点）
          </Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColName, styles.tableHeaderText]}>
              品名
            </Text>
            <Text style={[styles.tableColCategory, styles.tableHeaderText]}>
              カテゴリ
            </Text>
            <Text style={[styles.tableColDesc, styles.tableHeaderText]}>
              備考
            </Text>
          </View>
          {furnitureItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableColName}>{item.name}</Text>
              <Text style={styles.tableColCategory}>{item.category}</Text>
              <Text style={styles.tableColDesc}>{item.description ?? '—'}</Text>
            </View>
          ))}
        </View>

        {/* Action Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>管理会社様へのお願い</Text>
          {actionSteps.map((step, index) => (
            <View key={index} style={styles.stepBox}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>備考</Text>
          <Text style={styles.infoText}>
            ・次の住人候補への内見が実施される場合があります。内見日程は事前にご連絡いたします。
          </Text>
          <Text style={styles.infoText}>
            ・家具リストは暫定であり、最終的な引き継ぎ品目は合意時に確定します。
          </Text>
          <Text style={styles.infoText}>
            ・ご不明な点がございましたら、info@tsumugi.com
            までお問い合わせください。
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} tsumugi. All rights reserved.
          </Text>
          <Link src="https://tsumugi.com" style={styles.footerLink}>
            https://tsumugi.com
          </Link>
        </View>
      </Page>
    </Document>
  );
}

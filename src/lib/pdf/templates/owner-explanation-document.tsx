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
    marginBottom: 16,
    borderBottom: '1 solid #dddddd',
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
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
    color: '#555555',
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
  paragraph: {
    fontSize: 10,
    lineHeight: 1.7,
    marginBottom: 8,
    color: '#333333',
  },
  bulletList: {
    marginLeft: 16,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 16,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.6,
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
  highlightBox: {
    backgroundColor: '#F7F7F7',
    borderLeft: '3 solid #FF5A5F',
    padding: '10 14',
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
  },
  infoBox: {
    backgroundColor: '#F7F7F7',
    borderLeft: '3 solid #999999',
    padding: '10 14',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.5,
  },
  faqItem: {
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 10,
    fontWeight: 700,
    color: '#333333',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 9,
    color: '#555555',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 44,
    right: 44,
    borderTop: '1 solid #eeeeee',
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export interface OwnerExplanationDocumentProps {
  propertyName: string;
  propertyAddress: string;
  moveOutDate: string;
  sellerName: string;
  furnitureItems: FurnitureItem[];
  createdDate: string;
}

export function OwnerExplanationDocument({
  propertyName,
  propertyAddress,
  moveOutDate,
  sellerName,
  furnitureItems,
  createdDate,
}: OwnerExplanationDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerDate}>作成日: {createdDate}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>残置物引き継ぎのご相談</Text>

        {/* Section 1: sumitsugi概要 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>sumitsugiとは</Text>
          <Text style={styles.paragraph}>
            sumitsugi（住み継ぎ）は、退去する入居者と次の入居者との間で、家具・インテリアを引き継ぐことができるサービスです。
            処分ではなく「引き継ぎ」という形で、まだ使える家具を活かし、次の住人の引越しコストを削減します。
          </Text>
        </View>

        {/* Section 2: 物件情報 */}
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

        {/* Section 3: 家具リスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            引き継ぎ予定の家具リスト（{furnitureItems.length}点）
          </Text>
          {furnitureItems.length > 0 ? (
            <>
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
                  <Text style={styles.tableColDesc}>
                    {item.description || '—'}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.infoText}>家具リストは現在準備中です。</Text>
          )}
        </View>

        {/* Section 4: オーナー様のメリット */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>オーナー様のメリット</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                空室期間の短縮: 家具付き物件は入居が決まりやすい傾向があります
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                原状回復コストの削減: 家具搬出・処分が不要です
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                入居者満足度の向上:
                引越しコスト削減により入居者の満足度が上がります
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5: 管理会社への負担なし */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            管理会社様の負担が増えないこと
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              本サービスでは、家具の引き継ぎはsumitsugiが仲介し、前の住人と次の住人との間で直接行われます。
              管理会社様には、通常の退去・入居手続きのみを行っていただきます。
              家具に関する問い合わせや調整は、sumitsugiが対応いたします。
            </Text>
          </View>
        </View>

        {/* Section 6: 責任分界点 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>責任分界点</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                家具・インテリア: sumitsugiが責任を持ちます（破損・トラブル等）
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>
                物件・設備: 管理会社様が責任を持ちます（従来通り）
              </Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              原状回復について:
              引き継ぎ対象外の家具は、前の住人が退去時に搬出します。引き継ぎ予定の家具は、次の住人の入居まで室内に残します。
            </Text>
          </View>
        </View>

        {/* Section 7: よくある質問 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>よくある質問</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Q. オーナーに費用はかかりますか？
            </Text>
            <Text style={styles.faqAnswer}>
              A.
              いいえ、オーナー様に費用負担はございません。引き継ぎ費用は次の住人が支払います。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Q. トラブルが発生した場合はどうなりますか？
            </Text>
            <Text style={styles.faqAnswer}>
              A.
              家具に関するトラブルは、sumitsugiが責任を持って対応いたします。物件や設備に関するトラブルは、従来通り管理会社様にご対応いただきます。
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Q. 内見時に家具が残っていても問題ないですか？
            </Text>
            <Text style={styles.faqAnswer}>
              A.
              はい。むしろ家具付きの状態で内見できるため、次の入居希望者がイメージしやすく、入居が決まりやすい傾向があります。
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              本資料は sumitsugi（住み継ぎ）を通じて作成されました
            </Text>
            <Link src="https://sumitsugi.jp" style={styles.footerLink}>
              https://sumitsugi.jp
            </Link>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              お問い合わせ: info@sumitsugi.jp
            </Text>
            <Text />
          </View>
        </View>
      </Page>
    </Document>
  );
}

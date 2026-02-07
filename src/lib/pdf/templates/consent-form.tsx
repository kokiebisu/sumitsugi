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
    marginBottom: 20,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
    padding: '4 8',
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #eeeeee',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  label: {
    width: 110,
    fontSize: 9,
    color: '#666666',
    fontWeight: 700,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  blankLine: {
    flex: 1,
    fontSize: 10,
    borderBottom: '1 dotted #cccccc',
    minHeight: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #cccccc',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eeeeee',
    paddingVertical: 5,
    paddingHorizontal: 8,
    minHeight: 20,
  },
  tableColNo: {
    width: '8%',
    fontSize: 9,
  },
  tableColName: {
    width: '30%',
    fontSize: 9,
  },
  tableColCategory: {
    width: '18%',
    fontSize: 9,
  },
  tableColCondition: {
    width: '20%',
    fontSize: 9,
  },
  tableColRemarks: {
    width: '24%',
    fontSize: 9,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: '#666666',
  },
  clause: {
    fontSize: 9,
    marginBottom: 6,
    paddingLeft: 8,
    lineHeight: 1.6,
  },
  signatureBlock: {
    marginTop: 12,
    borderTop: '1 solid #eeeeee',
    paddingTop: 12,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    width: 100,
    fontSize: 9,
    fontWeight: 700,
    color: '#666666',
  },
  signatureLine: {
    flex: 1,
    borderBottom: '1 solid #333333',
    minHeight: 20,
    marginRight: 16,
  },
  signatureDate: {
    width: 140,
    fontSize: 9,
    color: '#666666',
  },
  dateLine: {
    borderBottom: '1 dotted #cccccc',
    minHeight: 16,
    width: 100,
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

interface FurnitureItem {
  name: string;
  category: string;
  condition?: string;
  remarks?: string;
}

interface ConsentFormProps {
  propertyAddress: string;
  roomNumber?: string;
  sellerName: string;
  buyerName?: string;
  furnitureItems: FurnitureItem[];
  createdDate: string;
}

export function ConsentForm({
  propertyAddress,
  roomNumber,
  sellerName,
  buyerName,
  furnitureItems,
  createdDate,
}: ConsentFormProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>tsumugi</Text>
          <Text style={styles.docId}>作成日: {createdDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>残置物引き継ぎ同意書</Text>

        {/* Property Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 物件情報</Text>
          <View style={styles.row}>
            <Text style={styles.label}>物件所在地</Text>
            <Text style={styles.value}>{propertyAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>部屋番号</Text>
            {roomNumber ? (
              <Text style={styles.value}>{roomNumber}</Text>
            ) : (
              <View style={styles.blankLine} />
            )}
          </View>
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 当事者</Text>
          <View style={styles.row}>
            <Text style={styles.label}>前の住人（甲）</Text>
            {sellerName ? (
              <Text style={styles.value}>{sellerName}</Text>
            ) : (
              <View style={styles.blankLine} />
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>次の住人（乙）</Text>
            {buyerName ? (
              <Text style={styles.value}>{buyerName}</Text>
            ) : (
              <View style={styles.blankLine} />
            )}
          </View>
        </View>

        {/* Furniture List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. 引き継ぎ対象物品（{furnitureItems.length}点）
          </Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColNo, styles.tableHeaderText]}>No.</Text>
            <Text style={[styles.tableColName, styles.tableHeaderText]}>
              品名
            </Text>
            <Text style={[styles.tableColCategory, styles.tableHeaderText]}>
              カテゴリ
            </Text>
            <Text style={[styles.tableColCondition, styles.tableHeaderText]}>
              状態
            </Text>
            <Text style={[styles.tableColRemarks, styles.tableHeaderText]}>
              備考
            </Text>
          </View>
          {furnitureItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableColNo}>{index + 1}</Text>
              <Text style={styles.tableColName}>{item.name}</Text>
              <Text style={styles.tableColCategory}>{item.category}</Text>
              <Text style={styles.tableColCondition}>
                {item.condition ?? '—'}
              </Text>
              <Text style={styles.tableColRemarks}>{item.remarks ?? '—'}</Text>
            </View>
          ))}
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 合意事項・責任分界</Text>
          <Text style={styles.clause}>
            (1)
            甲は上記物品を現状有姿にて乙に引き渡すものとし、引き渡し後の物品に関する責任は乙に移転するものとします。
          </Text>
          <Text style={styles.clause}>
            (2)
            乙は引き渡し前に物品の状態を確認し、確認済みの上で引き受けるものとします。
          </Text>
          <Text style={styles.clause}>
            (3)
            引き渡し後に発見された物品の瑕疵について、甲は一切の責任を負わないものとします。
          </Text>
          <Text style={styles.clause}>
            (4)
            本同意書の内容は、物件オーナーまたは管理会社の承認を得た上で効力を有するものとします。
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureBlock}>
          <Text style={styles.sectionTitle}>5. 署名</Text>

          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>前の住人（甲）</Text>
            <View style={styles.signatureLine} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.signatureDate}>日付: </Text>
              <View style={styles.dateLine} />
            </View>
          </View>

          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>次の住人（乙）</Text>
            <View style={styles.signatureLine} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.signatureDate}>日付: </Text>
              <View style={styles.dateLine} />
            </View>
          </View>

          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>承認（管理会社）</Text>
            <View style={styles.signatureLine} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.signatureDate}>日付: </Text>
              <View style={styles.dateLine} />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            tsumugi 残置物引き継ぎ同意書 | © {new Date().getFullYear()} tsumugi
          </Text>
        </View>
      </Page>
    </Document>
  );
}

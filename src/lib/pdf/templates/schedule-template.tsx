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
  timelineHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1 solid #cccccc',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eeeeee',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 24,
  },
  timelineColStep: {
    width: '8%',
    fontSize: 9,
  },
  timelineColEvent: {
    width: '28%',
    fontSize: 9,
  },
  timelineColDate: {
    width: '22%',
    fontSize: 9,
  },
  timelineColPerson: {
    width: '18%',
    fontSize: 9,
  },
  timelineColNotes: {
    width: '24%',
    fontSize: 9,
  },
  headerText: {
    fontSize: 8,
    fontWeight: 700,
    color: '#666666',
  },
  note: {
    fontSize: 9,
    marginBottom: 6,
    paddingLeft: 8,
    lineHeight: 1.6,
  },
  approvalBlock: {
    marginTop: 12,
    borderTop: '1 solid #eeeeee',
    paddingTop: 12,
  },
  approvalRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  approvalLabel: {
    width: 100,
    fontSize: 9,
    fontWeight: 700,
    color: '#666666',
  },
  approvalLine: {
    flex: 1,
    borderBottom: '1 solid #333333',
    minHeight: 20,
    marginRight: 16,
  },
  approvalDate: {
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

interface ScheduleStep {
  event: string;
  date?: string;
  person: string;
  notes?: string;
}

interface ScheduleTemplateProps {
  propertyAddress: string;
  roomNumber?: string;
  sellerName: string;
  buyerName?: string;
  moveOutDate?: string;
  moveInDate?: string;
  steps: ScheduleStep[];
  createdDate: string;
}

export function ScheduleTemplate({
  propertyAddress,
  roomNumber,
  sellerName,
  buyerName,
  moveOutDate,
  moveInDate,
  steps,
  createdDate,
}: ScheduleTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>sumitsugi</Text>
          <Text style={styles.docId}>作成日: {createdDate}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>引き継ぎ日程調整表</Text>

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

        {/* Parties & Key Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 関係者・主要日程</Text>
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
          <View style={styles.row}>
            <Text style={styles.label}>退去予定日</Text>
            {moveOutDate ? (
              <Text style={styles.value}>{moveOutDate}</Text>
            ) : (
              <View style={styles.blankLine} />
            )}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>入居予定日</Text>
            {moveInDate ? (
              <Text style={styles.value}>{moveInDate}</Text>
            ) : (
              <View style={styles.blankLine} />
            )}
          </View>
        </View>

        {/* Schedule Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. 日程タイムライン（{steps.length}ステップ）
          </Text>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timelineColStep, styles.headerText]}>No.</Text>
            <Text style={[styles.timelineColEvent, styles.headerText]}>
              イベント
            </Text>
            <Text style={[styles.timelineColDate, styles.headerText]}>
              予定日
            </Text>
            <Text style={[styles.timelineColPerson, styles.headerText]}>
              担当者
            </Text>
            <Text style={[styles.timelineColNotes, styles.headerText]}>
              備考
            </Text>
          </View>
          {steps.map((step, index) => (
            <View key={index} style={styles.timelineRow}>
              <Text style={styles.timelineColStep}>{index + 1}</Text>
              <Text style={styles.timelineColEvent}>{step.event}</Text>
              <Text style={styles.timelineColDate}>{step.date ?? '未定'}</Text>
              <Text style={styles.timelineColPerson}>{step.person}</Text>
              <Text style={styles.timelineColNotes}>{step.notes ?? '—'}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 注意事項</Text>
          <Text style={styles.note}>
            (1)
            各日程は関係者全員の合意の上で確定するものとし、変更がある場合は速やかに全関係者に連絡すること。
          </Text>
          <Text style={styles.note}>
            (2) クリーニングは退去後、入居前に完了する必要があります。
          </Text>
          <Text style={styles.note}>
            (3)
            家具引き継ぎの確認は、前の住人と次の住人が立ち会いの上で行うことを推奨します。
          </Text>
          <Text style={styles.note}>
            (4) 鍵の引き渡しは管理会社を通じて行うものとします。
          </Text>
        </View>

        {/* Approval */}
        <View style={styles.approvalBlock}>
          <Text style={styles.sectionTitle}>5. 確認・承認</Text>

          <View style={styles.approvalRow}>
            <Text style={styles.approvalLabel}>前の住人（甲）</Text>
            <View style={styles.approvalLine} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.approvalDate}>日付: </Text>
              <View style={styles.dateLine} />
            </View>
          </View>

          <View style={styles.approvalRow}>
            <Text style={styles.approvalLabel}>次の住人（乙）</Text>
            <View style={styles.approvalLine} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.approvalDate}>日付: </Text>
              <View style={styles.dateLine} />
            </View>
          </View>

          <View style={styles.approvalRow}>
            <Text style={styles.approvalLabel}>承認（管理会社）</Text>
            <View style={styles.approvalLine} />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.approvalDate}>日付: </Text>
              <View style={styles.dateLine} />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            sumitsugi 引き継ぎ日程調整表 | © {new Date().getFullYear()}{' '}
            sumitsugi
          </Text>
        </View>
      </Page>
    </Document>
  );
}

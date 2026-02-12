import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans JP',
    fontSize: 11,
    padding: '40 50',
    color: '#333333',
  },
  header: {
    marginBottom: 24,
    borderBottom: '1 solid #eeeeee',
    paddingBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FF5A5F',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: '#333333',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 9,
    color: '#888888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    borderTop: '1 solid #eeeeee',
    paddingTop: 12,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
});

interface SampleDocumentProps {
  title: string;
  propertyName: string;
  date: string;
  description?: string;
}

export function SampleDocument({
  title,
  propertyName,
  date,
  description,
}: SampleDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>sumitsugi</Text>
          <Text style={styles.tagline}>住人の暮らしを引き継ぐ</Text>
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>物件名</Text>
          <Text style={styles.value}>{propertyName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>作成日</Text>
          <Text style={styles.value}>{date}</Text>
        </View>

        {description && (
          <View style={styles.section}>
            <Text style={styles.label}>説明</Text>
            <Text style={styles.value}>{description}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>
            © {new Date().getFullYear()} sumitsugi. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

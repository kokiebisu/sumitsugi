import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

interface BaseLayoutProps {
  preview: string;
  children: ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>sumitsugi</Text>
            <Text style={styles.tagline}>住人の暮らしを引き継ぐ</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Content */}
          <Section style={styles.content}>{children}</Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              このメールは{' '}
              <Link href="https://sumitsugi.jp" style={styles.link}>
                sumitsugi
              </Link>{' '}
              から送信されました。
            </Text>
            <Text style={styles.footerText}>
              ご質問がありましたら{' '}
              <Link href="mailto:info@sumitsugi.jp" style={styles.link}>
                info@sumitsugi.jp
              </Link>{' '}
              までお問い合わせください。
            </Text>
            <Text style={styles.copyright}>
              &copy; {new Date().getFullYear()} sumitsugi. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f6f6',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    margin: '40px auto',
    maxWidth: '600px',
    padding: '0',
  },
  header: {
    padding: '32px 40px 16px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#FF5A5F',
    fontSize: '28px',
    fontWeight: '700' as const,
    letterSpacing: '-0.5px',
    margin: '0',
  },
  tagline: {
    color: '#666666',
    fontSize: '13px',
    margin: '4px 0 0',
  },
  hr: {
    borderColor: '#eeeeee',
    margin: '0 40px',
  },
  content: {
    padding: '24px 40px',
  },
  footer: {
    padding: '16px 40px 32px',
  },
  footerText: {
    color: '#999999',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0',
    textAlign: 'center' as const,
  },
  copyright: {
    color: '#cccccc',
    fontSize: '11px',
    margin: '12px 0 0',
    textAlign: 'center' as const,
  },
  link: {
    color: '#FF5A5F',
    textDecoration: 'none',
  },
};

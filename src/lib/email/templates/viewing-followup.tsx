import { Button, Heading, Text } from '@react-email/components';
import { BaseLayout } from './base-layout';

interface ViewingFollowupProps {
  recipientName: string;
  propertyTitle: string;
  viewingDate: string;
  deadlineDate: string;
  checklistUrl: string;
  furnitureNames?: string[];
}

/**
 * 内見後フォローメール（次の住人へ送信）
 *
 * 内見完了後に自動送信。7日以内の意向回答を促す。
 */
export function ViewingFollowup({
  recipientName,
  propertyTitle,
  viewingDate,
  deadlineDate,
  checklistUrl,
  furnitureNames,
}: ViewingFollowupProps) {
  return (
    <BaseLayout preview={`${propertyTitle}の内見ありがとうございました`}>
      <Heading as="h2" style={styles.heading}>
        内見ありがとうございました
      </Heading>

      <Text style={styles.text}>{recipientName} 様</Text>

      <Text style={styles.text}>
        以下の物件の内見にお越しいただきありがとうございました。引き継ぎをご希望の場合は、チェックリストにご回答ください。
      </Text>

      <Text style={styles.detail}>
        <strong>物件:</strong> {propertyTitle}
      </Text>
      <Text style={styles.detail}>
        <strong>内見日:</strong> {viewingDate}
      </Text>

      {furnitureNames && furnitureNames.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>引き継ぎ対象の家具</Text>
          {furnitureNames.map((name) => (
            <Text key={name} style={styles.furnitureItem}>
              {name}
            </Text>
          ))}
        </>
      )}

      <Text style={styles.deadline}>
        回答期限: {deadlineDate}（内見から7日以内）
      </Text>

      <Button href={checklistUrl} style={styles.button}>
        チェックリストに回答する
      </Button>

      <Text style={styles.note}>
        ※
        期限を過ぎた場合、引き継ぎの意向がないものとみなされる場合があります。ご了承ください。
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
  sectionLabel: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '16px 0 8px',
  },
  furnitureItem: {
    backgroundColor: '#f9f9f9',
    color: '#555555',
    fontSize: '13px',
    margin: '4px 0',
    padding: '8px 16px',
  },
  deadline: {
    backgroundColor: '#FFF3F3',
    borderLeft: '3px solid #FF5A5F',
    color: '#FF5A5F',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: '16px 0',
    padding: '12px 16px',
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

ViewingFollowup.PreviewProps = {
  recipientName: '山田太郎',
  propertyTitle: '世田谷区の家具付き物件',
  viewingDate: '2026年2月15日（日）10:00',
  deadlineDate: '2026年2月22日（土）',
  checklistUrl: 'https://sumitsugi.jp/viewings/vw-1/checklist',
  furnitureNames: ['ソファ', 'ベッド', 'デスク'],
} satisfies ViewingFollowupProps;

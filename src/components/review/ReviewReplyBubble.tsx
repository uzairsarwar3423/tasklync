import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors } from '../../design/colors';
import { fontFamily as fonts } from '../../design/typography';
import { radius } from '../../design/radius';

interface ReviewReplyBubbleProps {
  reply: string;
  workerName: string;
  repliedAt: string | null;
  workerAvatar?: string | null;
  style?: ViewStyle;
}

export const ReviewReplyBubble = ({
  reply,
  workerName,
  repliedAt,
  style,
}: ReviewReplyBubbleProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const parsedDate = parseISO(dateString);
      return `Replied ${format(parsedDate, 'MMM d, yyyy')}`;
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.headerText} numberOfLines={1}>
        Reply from {workerName}:
      </Text>

      <Text style={styles.replyText} numberOfLines={4}>
        {reply}
      </Text>

      {repliedAt && <Text style={styles.dateText}>{formatDate(repliedAt)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSection,
    borderRadius: radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryDark,
  },
  headerText: {
    fontFamily: fonts.jakarta.semiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  replyText: {
    fontFamily: fonts.jakarta.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dateText: {
    fontFamily: fonts.inter.regular,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
});

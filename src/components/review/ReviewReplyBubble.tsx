import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { format, parseISO } from 'date-fns';
import { colors } from '@design/colors';
import { fontFamily as fonts } from '@design/typography';
import { radius } from '@design/radius';

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
    } catch (e) {
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
      
      {repliedAt && (
        <Text style={styles.dateText}>
          {formatDate(repliedAt)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4', // colors.bgSuccess roughly
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  headerText: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 12,
    color: colors.primary, // Using primary since textGreen wasn't directly found in theme often
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
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 6,
  },
});

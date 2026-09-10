import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, Search, CheckCircle2, Calendar } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { colors } from '../../design/colors';
import { fontFamily } from '../../design/typography';
import { ConversationFilterTab } from '../../types/chat.types';

interface ConversationEmptyStateProps {
  searchQuery: string;
  activeTab: ConversationFilterTab;
  onClearSearch: () => void;
  onResetTab: () => void;
}

export const ConversationEmptyState: React.FC<ConversationEmptyStateProps> = ({
  searchQuery,
  activeTab,
  onClearSearch,
  onResetTab,
}) => {
  const router = useRouter();

  if (searchQuery.trim().length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Search size={32} color={colors.textMuted} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>No results found</Text>
        <Text style={styles.subtitle}>
          No conversations found matching "{searchQuery}". Try searching with a different name or profession.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            label="Clear Search"
            onPress={onClearSearch}
            variant="secondary"
            size="md"
          />
        </View>
      </View>
    );
  }

  if (activeTab === 'unread') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
          <CheckCircle2 size={32} color={colors.primaryDark} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>All caught up!</Text>
        <Text style={styles.subtitle}>
          You don't have any unread messages at the moment.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            label="View All Messages"
            onPress={onResetTab}
            variant="secondary"
            size="md"
          />
        </View>
      </View>
    );
  }

  if (activeTab === 'active') {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Calendar size={32} color={colors.primaryDark} strokeWidth={1.8} />
        </View>
        <Text style={styles.title}>No active conversations</Text>
        <Text style={styles.subtitle}>
          You don't have any in-progress or scheduled bookings with active chats.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            label="Explore Services"
            onPress={() => router.push('/(tabs)/explore')}
            variant="primary"
            size="md"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, styles.iconCircleBrand]}>
        <MessageSquare size={32} color={colors.primaryDark} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>No messages yet</Text>
      <Text style={styles.subtitle}>
        When you book a professional or receive updates, your conversation history will appear here.
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          label="Explore Services"
          onPress={() => router.push('/(tabs)/explore')}
          variant="primary"
          size="md"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 56,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconCircleSuccess: {
    backgroundColor: colors.primaryTint,
  },
  iconCircleBrand: {
    backgroundColor: colors.primaryTint,
  },
  title: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.jakarta.regular,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    alignSelf: 'center',
    minWidth: 160,
  },
});

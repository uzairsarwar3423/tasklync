import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ConversationFilterTab } from '../../types/chat.types';
import { colors } from '../../design/colors';
import { fontFamily } from '../../design/typography';

interface ConversationTabsProps {
  activeTab: ConversationFilterTab;
  onTabChange: (tab: ConversationFilterTab) => void;
  unreadCount?: number;
}

const TABS: { id: ConversationFilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'unread', label: 'Unread' },
];

export const ConversationTabs: React.FC<ConversationTabsProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 0,
}) => {
  const handlePress = (tabId: ConversationFilterTab) => {
    if (tabId !== activeTab) {
      onTabChange(tabId);
    }
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === 'unread' && unreadCount > 0;

        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>

            {showBadge && (
              <View style={[styles.badge, isActive && styles.badgeActive]}>
                <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: colors.primaryDark,
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabText: {
    fontFamily: fontFamily.jakarta.semiBold,
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    marginLeft: 6,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: {
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  badgeTextActive: {
    color: colors.primaryDark,
  },
});

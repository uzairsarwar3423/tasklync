import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HomeHeader } from '../../src/components/home/HomeHeader';
import { SearchPromptBar } from '../../src/components/home/SearchPromptBar';
import { CategoryGrid } from '../../src/components/home/CategoryGrid';
import { useCategories } from '../../src/hooks/useCategories';
import { useNearbyWorkers } from '../../src/hooks/useNearbyWorkers';
import { colors } from '../../src/design/colors';

export default function HomeScreen() {
  const { refetch: refetchCategories } = useCategories();
  const { refetch: refetchWorkers } = useNearbyWorkers();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const onRefresh = async () => {
    setRefreshing(true);
    // Refetch all home screen data
    await Promise.all([
      refetchCategories(),
      refetchWorkers(),
    ]);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 44 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]} // Android
          />
        }
      >
        <HomeHeader />
        
        <View style={styles.searchWrapper}>
          <SearchPromptBar />
        </View>
        
        <CategoryGrid />
        
        <View style={styles.placeholderBottom} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scrollContent: {
    paddingBottom: 120, // Space for tab bar + safe area padding
  },
  searchWrapper: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  placeholderBottom: {
    height: 400,
  },
});

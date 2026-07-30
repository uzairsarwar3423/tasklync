import { View, StyleSheet, ScrollView } from 'react-native';
// Assuming these were created in Day 8
import { SkeletonWorkerProfileHero } from './SkeletonWorkerProfileHero';
import { SkeletonWorkerStats } from './SkeletonWorkerStats';
import { SkeletonWorkerBio } from './SkeletonWorkerBio';
import { SkeletonWorkerSkillList } from './SkeletonWorkerSkillList';
import { SkeletonReviewSummary } from './SkeletonReviewSummary';
import { colors } from '@design/colors';

export const SkeletonWorkerProfile = () => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <SkeletonWorkerProfileHero />
        <View style={styles.contentCard}>
          <SkeletonWorkerStats />
          <View style={styles.divider} />
          <SkeletonWorkerBio />
          <View style={styles.divider} />
          <SkeletonWorkerSkillList />
          <View style={styles.divider} />
          <SkeletonReviewSummary />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  contentCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
});

import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { WorkerServiceRow } from './WorkerServiceRow';
import { SkeletonWorkerServiceRow } from '../ui/Skeleton/SkeletonWorkerServiceRow';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { WorkerServiceOffering } from '../../types/worker.types';

interface WorkerServicesSectionProps {
  services: WorkerServiceOffering[];
  workerId: string;
  workerName?: string;
  workerAvatar?: string | null;
  workerRating?: number;
  workerCategory?: string;
  workerVerified?: boolean;
  startingPrice?: number | null;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const WorkerServicesSection: React.FC<WorkerServicesSectionProps> = ({
  services,
  workerId,
  workerName,
  workerAvatar,
  workerRating,
  workerCategory,
  workerVerified,
  startingPrice,
  isLoading = false,
  style,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionHeader}>Services</Text>
        </View>
        <SkeletonWorkerServiceRow />
        <SkeletonWorkerServiceRow />
        <SkeletonWorkerServiceRow />
      </View>
    );
  }

  // If no custom service offerings returned, synthesize a primary service offering from worker stats
  const displayServices: WorkerServiceOffering[] =
    services && services.length > 0
      ? services
      : [
          {
            id: `fallback-${workerId}`,
            serviceName: workerCategory ? `General ${workerCategory} Service` : 'General Home Service',
            serviceNameUr: null,
            customPrice: startingPrice || 500,
            priceType: 'fixed',
            isCustom: false,
            notes: 'Includes standard diagnostic & service',
          },
        ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>Services</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{displayServices.length}</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {displayServices.map((service, index) => (
          <Animated.View
            key={service.id}
            entering={FadeInLeft.duration(300).delay(index * 40)}
            style={styles.rowWrapper}
          >
            <WorkerServiceRow
              service={service}
              workerId={workerId}
              workerName={workerName}
              workerAvatar={workerAvatar}
              workerRating={workerRating}
              workerCategory={workerCategory}
              workerVerified={workerVerified}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary || '#0F172A',
  },
  countBadge: {
    backgroundColor: colors.primaryTint || '#E6F4EA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontFamily: typography.fontFamily.inter.semiBold,
    fontSize: 12,
    color: colors.primary || '#16A34A',
  },
  listContainer: {
    width: '100%',
  },
  rowWrapper: {
    width: '100%',
  },
});

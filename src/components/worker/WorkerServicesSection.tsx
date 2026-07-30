import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { WorkerServiceRow } from './WorkerServiceRow';
import { SkeletonServiceListItem } from '../ui/Skeleton/SkeletonServiceListItem';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { WorkerServiceOffering } from '../../types/worker.types';

interface WorkerServicesSectionProps {
  services: WorkerServiceOffering[];
  workerId: string;
  workerCategory?: string;
  startingPrice?: number | null;
  isLoading?: boolean;
  style?: ViewStyle;
}

export const WorkerServicesSection: React.FC<WorkerServicesSectionProps> = ({
  services,
  workerId,
  workerCategory,
  startingPrice,
  isLoading = false,
  style,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.sectionHeader}>Services</Text>
        <SkeletonServiceListItem />
        <SkeletonServiceListItem />
        <SkeletonServiceListItem />
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
      <Text style={styles.sectionHeader}>Services</Text>
      
      <View style={styles.listContainer}>
        {displayServices.map((service, index) => (
          <Animated.View
            key={service.id}
            entering={FadeInLeft.duration(300).delay(index * 40)}
            style={styles.rowWrapper}
          >
            <WorkerServiceRow service={service} workerId={workerId} />
            {index < displayServices.length - 1 && <View style={styles.divider} />}
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
  sectionHeader: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 16,
    color: colors.textPrimary || '#0F172A',
    marginBottom: 10,
  },
  listContainer: {
    width: '100%',
  },
  rowWrapper: {
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border || '#E5E7EB',
    width: '100%',
  },
});

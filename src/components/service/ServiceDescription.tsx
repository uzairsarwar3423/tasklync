import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { Clock, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Service } from '../../types/category.types';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { AddToCartButton } from '../cart/AddToCartButton';

interface ServiceDescriptionProps {
  service: Service;
  workerId?: string | null;
  onAdd?: () => void;
}

export const ServiceDescription: React.FC<ServiceDescriptionProps> = ({
  service,
  workerId = null,
  onAdd,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  // Cast service to access potential custom properties
  const sAny = service as any;
  const description = service.description || 'No description available.';
  const includes = sAny.includes || [
    'Professional, background-verified technician',
    'Post-service clean up included',
    '30-day service warranty protection',
  ];
  const excludes = sAny.excludes || [
    'Premium spare parts and materials (charged at actuals)',
    'Major structural modifications',
  ];

  const handleToggleReadMore = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setExpanded(!expanded);
  };

  const formattedDuration = service.minDurationMins
    ? `${service.minDurationMins}–${service.minDurationMins + 30} mins`
    : '45–90 mins';

  return (
    <View style={styles.container}>
      {/* Description Text */}
      <View>
        <Text
          style={styles.descriptionText}
          numberOfLines={expanded ? undefined : 3}
        >
          {description}
        </Text>
        {description.length > 120 && (
          <Pressable
            onPress={handleToggleReadMore}
            hitSlop={8}
            style={styles.readMoreButton}
          >
            <Text style={styles.readMoreText}>
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Duration Row */}
      <View style={styles.durationRow}>
        <Clock
          size={14}
          color={colors.textMuted}
        />
        <Text style={styles.durationText}>
          Typically {formattedDuration}
        </Text>
      </View>

      {/* What's Included */}
      {includes.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Includes:</Text>
          {includes.map((item: string, idx: number) => (
            <View
              key={`inc-${idx}`}
              style={styles.bulletRow}
            >
              <Check
                size={13}
                color={colors.primary}
                style={styles.bulletIcon}
              />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* What's Not Included */}
      {excludes.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Excludes:</Text>
          {excludes.map((item: string, idx: number) => (
            <View
              key={`exc-${idx}`}
              style={styles.bulletRow}
            >
              <X
                size={13}
                color={colors.textDanger}
                style={styles.bulletIcon}
              />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Add To Cart Row */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => router.push(`/service/${service.id}` as any)}
          style={styles.detailsLink}
        >
          <Text style={styles.detailsLinkText}>View details & choose worker ➔</Text>
        </Pressable>
        <AddToCartButton
          serviceId={service.id}
          serviceName={service.name}
          price={service.basePrice || 0}
          workerId={workerId}
          size="sm"
          onAdd={onAdd}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 4,
  },
  descriptionText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  readMoreButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  durationText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionContainer: {
    marginTop: 12,
  },
  sectionHeader: {
    fontFamily: typography.fontFamily.poppins.semiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingRight: 10,
  },
  bulletIcon: {
    marginTop: 3,
    marginRight: 6,
  },
  bulletText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailsLink: {
    justifyContent: 'center',
    paddingVertical: 4,
  },
  detailsLinkText: {
    fontFamily: typography.fontFamily.jakarta.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../design/colors';
import { radius } from '../../design/radius';
import { typography } from '../../design/typography';

interface WorkerStatsProps {
  rating: number;
  totalReviews: number;
  totalJobs: number;
  avgResponseMins: number;
  onRatingPress?: () => void;
  style?: ViewStyle;
}

export const WorkerStats: React.FC<WorkerStatsProps> = ({
  rating,
  totalReviews,
  totalJobs,
  avgResponseMins,
  onRatingPress,
  style,
}) => {
  const [displayRating, setDisplayRating] = useState(0);
  const [displayJobs, setDisplayJobs] = useState(0);
  const [displayResponse, setDisplayResponse] = useState(0);

  useEffect(() => {
    // Rating count up
    let ratingVal = 0;
    const ratingInterval = setInterval(() => {
      ratingVal += rating / 40; // ~800ms
      if (ratingVal >= rating) {
        setDisplayRating(rating);
        clearInterval(ratingInterval);
      } else {
        setDisplayRating(parseFloat(ratingVal.toFixed(1)));
      }
    }, 20);

    // Jobs count up (staggered by 150ms)
    let jobsVal = 0;
    let jobsInterval: any;
    const jobsTimeout = setTimeout(() => {
      jobsInterval = setInterval(() => {
        const increment = Math.max(1, Math.ceil(totalJobs / 40));
        jobsVal += increment;
        if (jobsVal >= totalJobs) {
          setDisplayJobs(totalJobs);
          clearInterval(jobsInterval);
        } else {
          setDisplayJobs(jobsVal);
        }
      }, 20);
    }, 150);

    // Response count up (staggered by 300ms)
    let respVal = 0;
    let respInterval: any;
    const respTimeout = setTimeout(() => {
      respInterval = setInterval(() => {
        const increment = Math.max(1, Math.ceil(avgResponseMins / 40));
        respVal += increment;
        if (respVal >= avgResponseMins) {
          setDisplayResponse(avgResponseMins);
          clearInterval(respInterval);
        } else {
          setDisplayResponse(respVal);
        }
      }, 20);
    }, 300);

    return () => {
      clearInterval(ratingInterval);
      if (jobsInterval) clearInterval(jobsInterval);
      if (respInterval) clearInterval(respInterval);
      clearTimeout(jobsTimeout);
      clearTimeout(respTimeout);
    };
  }, [rating, totalJobs, avgResponseMins]);

  const handleRatingPress = () => {
    Haptics.selectionAsync();
    if (onRatingPress) {
      onRatingPress();
    }
  };

  // Render yellow stars dynamically
  const renderStars = () => {
    // Space constraints: render up to 3 stars as social proof
    return (
      <View style={styles.starRow}>
        <Star size={10} color="#EAB308" fill="#EAB308" />
        <Star size={10} color="#EAB308" fill="#EAB308" style={styles.starSpacing} />
        <Star size={10} color="#EAB308" fill="#EAB308" style={styles.starSpacing} />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Cell 1: Rating */}
      <Pressable onPress={handleRatingPress} style={styles.cell}>
        <Text style={styles.valueText}>{displayRating.toFixed(1)}</Text>
        {renderStars()}
        <Text style={styles.labelText}>Rating ({totalReviews})</Text>
      </Pressable>

      {/* Cell 2: Completed Jobs */}
      <View style={[styles.cell, styles.middleBorder]}>
        <View style={styles.valueWithUnit}>
          <Text style={styles.valueText}>{displayJobs}</Text>
          <Text style={styles.unitText}>jobs</Text>
        </View>
        <Text style={styles.labelText}>Completed</Text>
      </View>

      {/* Cell 3: Average Response Time */}
      <View style={styles.cell}>
        <View style={styles.valueWithUnit}>
          <Text style={styles.valueText}>~{displayResponse}</Text>
          <Text style={styles.unitText}>min</Text>
        </View>
        <Text style={styles.labelText}>Response</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgSection || '#F9FAFB',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
    width: '100%',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  middleBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border || '#E5E7EB',
  },
  valueText: {
    fontFamily: typography.fontFamily.inter.bold,
    fontSize: 20,
    color: colors.textPrimary || '#0F172A',
  },
  valueWithUnit: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted || '#6B7280',
    marginLeft: 2,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  starSpacing: {
    marginLeft: 2,
  },
  labelText: {
    fontFamily: typography.fontFamily.jakarta.regular,
    fontSize: 11,
    color: colors.textMuted || '#6B7280',
    marginTop: 2,
  },
});

import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { Award, CheckCircle2, Clock, MapPin } from 'lucide-react-native';
import { fontFamily } from '../../design/typography';

export interface WorkerStatsProps {
  yearsExperience?: number;
  totalJobs?: number;
  avgResponseMins?: number;
  distanceLabel?: string;
  style?: ViewStyle;
}

export const WorkerStats: React.FC<WorkerStatsProps> = ({
  yearsExperience,
  totalJobs = 0,
  avgResponseMins,
  distanceLabel,
  style,
}) => {
  const expDisplay = typeof yearsExperience === 'number' && yearsExperience > 0
    ? `${yearsExperience}+ ${yearsExperience === 1 ? 'yr' : 'yrs'}`
    : '< 1 yr';

  const responseDisplay = typeof avgResponseMins === 'number' && avgResponseMins > 0
    ? `~${avgResponseMins} min`
    : 'Quick';

  const rangeDisplay = distanceLabel?.trim() || 'Nearby';

  return (
    <View style={[styles.container, style]}>
      {/* Col 1: Experience */}
      <View style={styles.col}>
        <Award size={18} color="#16A34A" strokeWidth={2.2} style={styles.icon} />
        <Text style={styles.valueText}>
          {expDisplay}
        </Text>
        <Text style={styles.labelText}>Experience</Text>
      </View>

      <View style={styles.divider} />

      {/* Col 2: Jobs Done */}
      <View style={styles.col}>
        <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.2} style={styles.icon} />
        <Text style={styles.valueText}>
          {totalJobs}
        </Text>
        <Text style={styles.labelText}>Jobs Done</Text>
      </View>

      <View style={styles.divider} />

      {/* Col 3: Response Time */}
      <View style={styles.col}>
        <Clock size={18} color="#16A34A" strokeWidth={2.2} style={styles.icon} />
        <Text style={styles.valueText}>
          {responseDisplay}
        </Text>
        <Text style={styles.labelText}>Response Time</Text>
      </View>

      <View style={styles.divider} />

      {/* Col 4: Service Range */}
      <View style={styles.col}>
        <MapPin size={18} color="#16A34A" strokeWidth={2.2} style={styles.icon} />
        <Text style={styles.valueText} numberOfLines={1}>
          {rangeDisplay}
        </Text>
        <Text style={styles.labelText}>Service Range</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 6,
    width: '100%',
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  icon: {
    marginBottom: 4,
  },
  valueText: {
    fontFamily: fontFamily.jakarta.bold,
    fontSize: 13.5,
    color: '#0F172A',
    textAlign: 'center',
  },
  labelText: {
    fontFamily: fontFamily.jakarta.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
});

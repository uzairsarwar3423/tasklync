import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, ShieldCheck } from 'lucide-react-native';
import { NextStepItem } from './NextStepItem';
import { colors, fontFamily } from '../../../design';

export const NextStepsList: React.FC = () => {
  const steps = [
    {
      stepNumber: 1,
      icon: <Clock size={16} color={colors.primaryDark} strokeWidth={2.2} />,
      title: 'Provider Acceptance',
      description: 'Worker will review & accept your booking within 30 minutes.',
    },
    {
      stepNumber: 2,
      icon: <MapPin size={16} color={colors.primaryDark} strokeWidth={2.2} />,
      title: 'Live Tracking',
      description: 'Track real-time provider arrival and job status updates.',
    },
    {
      stepNumber: 3,
      icon: <ShieldCheck size={16} color={colors.primaryDark} strokeWidth={2.2} />,
      title: 'Job Done & Release Payment',
      description: 'Payment released only after job is completed to your satisfaction.',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What Happens Next?</Text>

      {steps.map((s) => (
        <NextStepItem
          key={`next-step-${s.stepNumber}`}
          stepNumber={s.stepNumber}
          icon={s.icon}
          title={s.title}
          description={s.description}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: 12,
  },
});

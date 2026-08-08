import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StepDot, StepState } from './StepDot';
import { StepConnectorLine } from './StepConnectorLine';
import { StepLabel } from './StepLabel';
import { palette } from '../../design';

export interface StepProgressProps {
  steps?: string[];
  /**
   * activeIndex: 0-indexed step that is currently active.
   * e.g. 0 = Services active, 1 = Schedule active, 2 = Address active, 3 = Review active.
   * If currentStep is provided as 1-based (e.g. 2 for Schedule), it is normalized to 0-based.
   */
  activeIndex?: number;
  currentStep?: number; // Optional 1-based step alias (e.g. 2 = Schedule)
}

const DEFAULT_STEPS = ['Services', 'Schedule', 'Address', 'Review'];

export const StepProgress: React.FC<StepProgressProps> = ({
  steps = DEFAULT_STEPS,
  activeIndex,
  currentStep,
}) => {
  // Normalize active index (0-based)
  const resolvedActiveIndex =
    typeof activeIndex === 'number'
      ? activeIndex
      : typeof currentStep === 'number'
      ? currentStep - 1
      : 1; // Default to step index 1 (Schedule) if unspecified

  return (
    <View style={styles.container}>
      {/* Upper Row: Dots & Connectors */}
      <View style={styles.dotsRow}>
        {steps.map((_, index) => {
          let state: StepState = 'future';
          if (index < resolvedActiveIndex) {
            state = 'complete';
          } else if (index === resolvedActiveIndex) {
            state = 'active';
          }

          const showConnector = index < steps.length - 1;
          const isConnectorFilled = index < resolvedActiveIndex;

          return (
            <React.Fragment key={`step-dot-${index}`}>
              <View style={styles.dotColumn}>
                <StepDot stepNumber={index + 1} state={state} />
              </View>
              {showConnector && (
                <StepConnectorLine isFilled={isConnectorFilled} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Lower Row: Labels */}
      <View style={styles.labelsRow}>
        {steps.map((label, index) => {
          let state: StepState = 'future';
          if (index < resolvedActiveIndex) {
            state = 'complete';
          } else if (index === resolvedActiveIndex) {
            state = 'active';
          }

          return (
            <View key={`step-label-${index}`} style={styles.labelColumn}>
              <StepLabel label={label} state={state} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  labelColumn: {
    flex: 1,
    alignItems: 'center',
  },
});

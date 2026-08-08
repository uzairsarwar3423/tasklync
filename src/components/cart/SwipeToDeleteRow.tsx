import { FC, ReactNode, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { springConfig } from '../../design/animations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80; // Distance in px required to commit delete

interface SwipeToDeleteRowProps {
  children: ReactNode;
  onDelete: () => void;
}

export const SwipeToDeleteRow: FC<SwipeToDeleteRowProps> = ({
  children,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(84); // Default row height constraint
  const opacity = useSharedValue(1);

  const triggerCommitHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const handleFinishDelete = () => {
    onDelete();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Only allow swiping left (negative translateX)
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -SCREEN_WIDTH * 0.4);
      } else {
        translateX.value = 0;
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        // Commit delete action
        runOnJS(triggerCommitHaptic)();
        runOnJS(setIsDeleting)(true);
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });

        // Collapse row height to 0
        itemHeight.value = withSpring(0, springConfig.gentle, (finished) => {
          if (finished) {
            runOnJS(handleFinishDelete)();
          }
        });
      } else {
        // Snap back to normal
        translateX.value = withSpring(0, springConfig.stiff);
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: isDeleting ? itemHeight.value : undefined,
    opacity: opacity.value,
    marginBottom: isDeleting ? itemHeight.value === 0 ? 0 : 8 : 8,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Red Delete Background Layer */}
      <View style={styles.deleteBackground}>
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            triggerCommitHaptic();
            onDelete();
          }}
        >
          <Trash2 size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Foreground Content Row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.foreground, animatedRowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EF4444', // Danger Red
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 24,
  },
  deleteButton: {
    width: 60,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foreground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
});

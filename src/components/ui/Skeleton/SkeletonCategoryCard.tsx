import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export const SkeletonCategoryCard = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={68} height={68} borderRadius={20} />
      <View style={styles.labelContainer}>
        <Skeleton width={52} height={13} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 76,
  },
  labelContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
});

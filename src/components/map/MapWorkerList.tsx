import { FC, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { WorkerNearby } from '../../types/worker.types';
import { MapWorkerCard } from './MapWorkerCard';
import { MapSkeletonCard } from './MapSkeletonCard';
import { MapEmptyState } from './MapEmptyState';

interface MapWorkerListProps {
  workers: WorkerNearby[];
  isLoading: boolean;
  selectedId: string | null;
  onSelectWorker: (worker: WorkerNearby) => void;
  onBookWorker?: (worker: WorkerNearby) => void;
  onResetFilters: () => void;
}

const CARD_WIDTH = 270;
const CARD_MARGIN = 12;
const ITEM_SIZE = CARD_WIDTH + CARD_MARGIN;

export const MapWorkerList: FC<MapWorkerListProps> = ({
  workers,
  isLoading,
  selectedId,
  onSelectWorker,
  onBookWorker,
  onResetFilters,
}) => {
  const flatListRef = useRef<FlatList<WorkerNearby>>(null);

  // Sync bridge: when selectedId changes (e.g. from pin tap), scroll list to matching card
  useEffect(() => {
    if (!selectedId || workers.length === 0) return;

    const index = workers.findIndex((w) => w.id === selectedId);
    if (index !== -1 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // Center the card in the viewport
        });
      } catch (_e) {
        // Fallback scrollToOffset if index calculation fails before layout completes
        flatListRef.current.scrollToOffset({
          offset: index * ITEM_SIZE,
          animated: true,
        });
      }
    }
  }, [selectedId, workers]);

  const renderItem = useCallback(
    ({ item }: { item: WorkerNearby }) => {
      const isSelected = item.id === selectedId;
      return (
        <MapWorkerCard
          worker={item}
          isSelected={isSelected}
          onPressCard={onSelectWorker}
          onPressBook={onBookWorker}
        />
      );
    },
    [selectedId, onSelectWorker, onBookWorker]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_SIZE,
      offset: ITEM_SIZE * index,
      index,
    }),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.skeletonContainer}>
        <MapSkeletonCard />
        <MapSkeletonCard />
      </View>
    );
  }

  if (workers.length === 0) {
    return <MapEmptyState onResetFilters={onResetFilters} />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={workers}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      getItemLayout={getItemLayout}
      decelerationRate="fast"
      snapToInterval={ITEM_SIZE}
      snapToAlignment="center"
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
});

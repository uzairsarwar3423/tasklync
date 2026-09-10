import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { useLocationStore } from '../../src/store/location.store';
import { useMapFilterStore } from '../../src/store/mapFilter.store';
import { useNearbyWorkers } from '../../src/hooks/useNearbyWorkers';
import { useMapCamera } from '../../src/hooks/useMapCamera';
import { useMarkerSelection } from '../../src/hooks/useMarkerSelection';
import { WorkerNearby } from '../../src/types/worker.types';
import { getCategoryMeta } from '../../src/components/map/WorkerMarkerBadge';

import { MapCanvas } from '../../src/components/map/MapCanvas';
import { MapTopBar } from '../../src/components/map/MapTopBar';
import { MapControls } from '../../src/components/map/MapControls';
import { MapBottomPanel } from '../../src/components/map/MapBottomPanel';
import { MapPanelHeader } from '../../src/components/map/MapPanelHeader';
import { MapWorkerList } from '../../src/components/map/MapWorkerList';
import { colors } from '../../src/design/colors';

export default function LiveMapScreen() {
  const router = useRouter();
  const { currentLocation } = useLocationStore();
  const { selectedCategory, resetFilter } = useMapFilterStore();

  const {
    mapRef,
    hasPannedAway,
    flyTo,
    recenter,
    zoomIn,
    zoomOut,
    onRegionChangeComplete,
  } = useMapCamera();

  const { selectedId, selectWorker } = useMarkerSelection();

  // Fetch nearby workers synced with active category filter
  const { workers, isLoading } = useNearbyWorkers({
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(currentLocation?.lat !== undefined ? { lat: currentLocation.lat } : {}),
    ...(currentLocation?.lng !== undefined ? { lng: currentLocation.lng } : {}),
    radius: 5000, // 5km search radius
    limit: 20,
  });

  // Handle marker selection (pin tap -> fly to pin & select card)
  const handleSelectMarker = useCallback(
    (worker: WorkerNearby) => {
      selectWorker(worker.id);
      const lat = worker.lat ?? (worker as any).latitude;
      const lng = worker.lng ?? (worker as any).longitude;
      if (lat && lng) {
        flyTo({ lat, lng }, true);
      }
    },
    [selectWorker, flyTo]
  );

  // Handle card press (card tap -> fly camera to marker & select)
  const handlePressCard = useCallback(
    (worker: WorkerNearby) => {
      selectWorker(worker.id);
      const lat = worker.lat ?? (worker as any).latitude;
      const lng = worker.lng ?? (worker as any).longitude;
      if (lat && lng) {
        flyTo({ lat, lng }, true);
      }
    },
    [selectWorker, flyTo]
  );

  // Handle book CTA button tap -> navigate to worker detail
  const handleBookWorker = useCallback(
    (worker: WorkerNearby) => {
      router.push(`/worker/${worker.id}`);
    },
    [router]
  );

  // Category label meta for panel header display
  const categoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    return getCategoryMeta(selectedCategory).label;
  }, [selectedCategory]);

  const handleRegionChange = useCallback(
    (region: any) => {
      onRegionChangeComplete(region, currentLocation);
    },
    [onRegionChangeComplete, currentLocation]
  );

  const handleRecenter = useCallback(() => {
    recenter(currentLocation);
  }, [recenter, currentLocation]);

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* 1. Full-screen map canvas */}
      <MapCanvas
        mapRef={mapRef}
        userLocation={currentLocation}
        workers={workers}
        selectedId={selectedId}
        onSelectWorker={handleSelectMarker}
        onRegionChangeComplete={handleRegionChange}
        radiusMeters={5000}
      />

      {/* 2. Floating Top Header & Category Filter Chips */}
      <MapTopBar showSearchBar={true} />

      {/* 3. Right-edge floating map controls stack (Recenter + Zoom) */}
      <MapControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onRecenter={handleRecenter}
        showRecenter={hasPannedAway}
        style={styles.mapControlsPosition}
      />

      {/* 4. Bottom Draggable Panel containing Worker List */}
      <MapBottomPanel>
        <MapPanelHeader
          count={workers.length}
          isLoading={isLoading}
          categoryLabel={categoryLabel}
        />
        <MapWorkerList
          workers={workers}
          isLoading={isLoading}
          selectedId={selectedId}
          onSelectWorker={handlePressCard}
          onBookWorker={handleBookWorker}
          onResetFilters={resetFilter}
        />
      </MapBottomPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  mapControlsPosition: {
    position: 'absolute',
    right: 16,
    bottom: 230, // Elevated above bottom sheet collapsed snap height
    zIndex: 15,
  },
});

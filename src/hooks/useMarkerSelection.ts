import { useState, useCallback } from 'react';

export interface UseMarkerSelectionReturn {
  selectedId: string | null;
  selectWorker: (id: string | null) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useMarkerSelection = (initialId: string | null = null): UseMarkerSelectionReturn => {
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  const selectWorker = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedId === id,
    [selectedId]
  );

  return {
    selectedId,
    selectWorker,
    clearSelection,
    isSelected,
  };
};

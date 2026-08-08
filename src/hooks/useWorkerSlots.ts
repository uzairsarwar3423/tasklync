import { useState, useEffect, useCallback } from 'react';

export interface SlotInfo {
  id: string;
  timeStr: string;
  available: boolean;
  isPeak?: boolean;
}

const DEFAULT_TIME_SLOTS: string[] = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

export function useWorkerSlots(dateStr: string | null, workerId?: string | null) {
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchSlots = useCallback(() => {
    if (!dateStr) {
      setSlots([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    // Simulate network fetch delay
    const timer = setTimeout(() => {
      // Deterministically generate slot availability based on dateStr and workerId string hash
      const hashSeed = (dateStr + (workerId || 'default'))
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const generatedSlots: SlotInfo[] = DEFAULT_TIME_SLOTS.map((timeStr, idx) => {
        // Create realistic slot availability pattern
        const isUnavailable = (hashSeed + idx * 7) % 5 === 0;
        const isPeak = idx === 1 || idx === 6; // 9:00 AM and 3:00 PM are peak demand

        return {
          id: `slot-${dateStr}-${idx}`,
          timeStr,
          available: !isUnavailable,
          isPeak,
        };
      });

      setSlots(generatedSlots);
      setIsLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [dateStr, workerId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return {
    slots,
    isLoading,
    isError,
    refetch: fetchSlots,
  };
}

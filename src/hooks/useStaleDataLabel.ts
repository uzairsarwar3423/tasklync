import { useState, useEffect, useMemo } from 'react';
import { NETWORK_CONFIG } from '../config/networkConfig';

export interface StaleDataLabelResult {
  label: string;
  fullAccessibilityLabel: string;
  isStale: boolean;
  ageSeconds: number;
}

/**
 * Calculates human-readable relative timestamp with full accessible text.
 */
function computeLabels(cachedAtMs: number, nowMs: number): {
  label: string;
  fullAccessibilityLabel: string;
  ageSeconds: number;
} {
  const diffMs = Math.max(0, nowMs - cachedAtMs);
  const ageSeconds = Math.floor(diffMs / 1000);
  const ageMinutes = Math.floor(ageSeconds / 60);
  const ageHours = Math.floor(ageMinutes / 60);
  const ageDays = Math.floor(ageHours / 24);

  if (ageMinutes < 1) {
    return {
      label: 'Updated just now',
      fullAccessibilityLabel: 'Content last updated just now',
      ageSeconds,
    };
  }

  if (ageMinutes < 60) {
    return {
      label: `Updated ${ageMinutes}m ago`,
      fullAccessibilityLabel: `Content last updated ${ageMinutes} minute${
        ageMinutes === 1 ? '' : 's'
      } ago`,
      ageSeconds,
    };
  }

  if (ageHours < 24) {
    return {
      label: `Updated ${ageHours}h ago`,
      fullAccessibilityLabel: `Content last updated ${ageHours} hour${
        ageHours === 1 ? '' : 's'
      } ago`,
      ageSeconds,
    };
  }

  if (ageDays === 1) {
    return {
      label: 'Updated yesterday',
      fullAccessibilityLabel: 'Content last updated yesterday',
      ageSeconds,
    };
  }

  return {
    label: `Updated ${ageDays}d ago`,
    fullAccessibilityLabel: `Content last updated ${ageDays} days ago`,
    ageSeconds,
  };
}

/**
 * Custom hook that generates auto-ticking relative timestamps for cached-first content.
 * 
 * Features:
 * 1. Ticks on a 30-second interval (Section 3.3) so "4m ago" cleanly becomes "5m ago"
 * 2. Provides full unabbreviated text for screen readers (Section 12)
 * 3. Does not trigger extraneous animations on tick
 */
export function useStaleDataLabel(
  cachedAt?: number | Date | null,
  staleThresholdMs: number = 60 * 1000 // default 1 minute threshold
): StaleDataLabelResult {
  const [now, setNow] = useState<number>(() => Date.now());

  const cachedAtMs = useMemo(() => {
    if (!cachedAt) return null;
    return typeof cachedAt === 'number' ? cachedAt : cachedAt.getTime();
  }, [cachedAt]);

  useEffect(() => {
    if (!cachedAtMs) return;

    // Tick every 30 seconds to update relative time
    const interval = setInterval(() => {
      setNow(Date.now());
    }, NETWORK_CONFIG.STALE_BADGE_TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [cachedAtMs]);

  if (!cachedAtMs) {
    return {
      label: '',
      fullAccessibilityLabel: '',
      isStale: false,
      ageSeconds: 0,
    };
  }

  const { label, fullAccessibilityLabel, ageSeconds } = computeLabels(
    cachedAtMs,
    now
  );
  const isStale = now - cachedAtMs > staleThresholdMs;

  return {
    label,
    fullAccessibilityLabel,
    isStale,
    ageSeconds,
  };
}

import { useEffect, useState, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { ConnectionType, NetworkStatus } from '../types/network.types';
import { NETWORK_CONFIG } from '../config/networkConfig';

function mapConnectionType(type: NetInfoStateType): ConnectionType {
  switch (type) {
    case NetInfoStateType.wifi:
      return 'wifi';
    case NetInfoStateType.cellular:
      return 'cellular';
    case NetInfoStateType.bluetooth:
      return 'bluetooth';
    case NetInfoStateType.ethernet:
      return 'ethernet';
    case NetInfoStateType.wimax:
      return 'wimax';
    case NetInfoStateType.vpn:
      return 'vpn';
    case NetInfoStateType.none:
      return 'none';
    case NetInfoStateType.unknown:
    default:
      return 'unknown';
  }
}

/**
 * Custom hook for resilient network connectivity monitoring.
 * Features:
 * 1. 500ms debounce on state transitions (prevents banner flickering in elevators/tunnels/subways)
 * 2. Distinguishes between interface connection (Wi-Fi associated) and true internet reachability
 * 3. Single source of truth boolean `isOffline`
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'unknown',
    isOffline: false,
    details: null,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    const handleNetInfoChange = (state: NetInfoState) => {
      const isConnected = Boolean(state.isConnected);
      const isInternetReachable = state.isInternetReachable;
      const connectionType = mapConnectionType(state.type);

      // Single source of truth: if disconnected or reachability is confirmed false, we are offline.
      // If reachability is null (still probing), fall back to isConnected.
      const isOffline = !isConnected || isInternetReachable === false;

      const nextStatus: NetworkStatus = {
        isConnected,
        isInternetReachable,
        connectionType,
        isOffline,
        details: state.details,
      };

      // On initial cold mount, set immediately without debounce
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
        setNetworkStatus(nextStatus);
        return;
      }

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce transitions by 500ms to absorb rapid flapping or 1-second blips
      debounceTimerRef.current = setTimeout(() => {
        setNetworkStatus(nextStatus);
      }, NETWORK_CONFIG.DEBOUNCE_MS);
    };

    // Initial fetch
    NetInfo.fetch().then(handleNetInfoChange);

    // Continuous subscription
    const unsubscribe = NetInfo.addEventListener(handleNetInfoChange);

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return networkStatus;
}

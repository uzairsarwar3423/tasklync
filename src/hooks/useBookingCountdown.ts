import { useEffect } from 'react';
import { runOnJS, useSharedValue, useDerivedValue } from 'react-native-reanimated';

export function useBookingCountdown(expiresAt: string | undefined) {
  const remainingSeconds = useSharedValue(0);
  const isExpired = useSharedValue(false);

  useEffect(() => {
    if (!expiresAt) {
      remainingSeconds.value = 0;
      isExpired.value = true;
      return;
    }

    const expiryTime = new Date(expiresAt).getTime();
    
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      remainingSeconds.value = diff;
      
      if (diff === 0) {
        isExpired.value = true;
      } else {
        isExpired.value = false;
      }
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, remainingSeconds, isExpired]);

  const minutes = useDerivedValue(() => {
    const mins = Math.floor(remainingSeconds.value / 60);
    return mins.toString().padStart(2, '0');
  });

  const seconds = useDerivedValue(() => {
    const secs = remainingSeconds.value % 60;
    return secs.toString().padStart(2, '0');
  });

  return { minutes, seconds, isExpired };
}

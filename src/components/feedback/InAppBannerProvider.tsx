import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { InAppBanner, InAppBannerData } from './InAppBanner';
import { resolveNotificationRoute } from '../../utils/deepLink';

interface InAppBannerContextValue {
  showBanner: (data: InAppBannerData) => void;
}

const InAppBannerContext = createContext<InAppBannerContextValue>({
  showBanner: () => {},
});

export const useInAppBanner = () => useContext(InAppBannerContext);

export function InAppBannerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeBanner, setActiveBanner] = useState<InAppBannerData | null>(null);
  const queueRef = useRef<InAppBannerData[]>([]);
  const isTransitioningRef = useRef<boolean>(false);

  const processNext = useCallback(() => {
    if (isTransitioningRef.current) return;

    if (queueRef.current.length > 0) {
      isTransitioningRef.current = true;
      const next = queueRef.current.shift()!;
      setActiveBanner(next);
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 300);
    } else {
      setActiveBanner(null);
      isTransitioningRef.current = false;
    }
  }, []);

  const showBanner = useCallback(
    (data: InAppBannerData) => {
      // Collapse or cap queue to max 3 items
      if (queueRef.current.length >= 3) {
        queueRef.current = [
          ...queueRef.current.slice(0, 1),
          {
            id: `summary_${Date.now()}`,
            title: 'Multiple New Updates',
            body: `You have new notifications waiting in your feed.`,
            category: 'default',
            deepLink: '/notifications',
          },
        ];
        return;
      }

      if (!activeBanner) {
        setActiveBanner(data);
      } else {
        queueRef.current.push(data);
      }
    },
    [activeBanner]
  );

  const handleBannerPress = useCallback(
    (data: InAppBannerData) => {
      const targetRoute = resolveNotificationRoute({
        deep_link: data.deepLink,
        type: data.category,
        ...(data.data || {}),
      });

      if (targetRoute) {
        try {
          router.push(targetRoute as any);
        } catch {
          router.push('/notifications' as any);
        }
      }
    },
    [router]
  );

  const handleBannerDismiss = useCallback(() => {
    setActiveBanner(null);
    setTimeout(() => {
      processNext();
    }, 200);
  }, [processNext]);

  return (
    <InAppBannerContext.Provider value={{ showBanner }}>
      {children}
      {activeBanner && (
        <InAppBanner
          key={activeBanner.id}
          data={activeBanner}
          onPress={handleBannerPress}
          onDismiss={handleBannerDismiss}
        />
      )}
    </InAppBannerContext.Provider>
  );
}

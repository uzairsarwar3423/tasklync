import React from 'react';
import { AuthProvider } from './AuthProvider';
import { SocketProvider } from './SocketProvider';
import { NotificationProvider } from './NotificationProvider';
import { InAppBannerProvider } from '../components/feedback/InAppBannerProvider';
import { ToastProvider } from './ToastProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <SocketProvider>
        <InAppBannerProvider>
          <NotificationProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NotificationProvider>
        </InAppBannerProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

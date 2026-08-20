import { useState, useCallback, useRef } from 'react';
import { chatApi } from '../services/api/chat.api';
import { chatSocket } from '../services/socket/chat.socket';

interface UploadTask {
  messageId: string;
  bookingId: string;
  localCompressedUri: string;
  status: 'uploading' | 'sent' | 'failed';
  progress: number;
}

export function useMediaUpload() {
  const [uploadTasks, setUploadTasks] = useState<Record<string, UploadTask>>({});
  const tasksRef = useRef<Record<string, UploadTask>>({});
  tasksRef.current = uploadTasks;

  /**
   * Upload an image to server with progress tracking and failure handling.
   * On success: flips status to 'sent' and fires socket event.
   * On failure: flips status to 'failed', preserving message in thread for retry.
   */
  const uploadImage = useCallback(
    async (
      messageId: string,
      bookingId: string,
      localCompressedUri: string,
      content: string = 'Photo'
    ) => {
      const initialTask: UploadTask = {
        messageId,
        bookingId,
        localCompressedUri,
        status: 'uploading',
        progress: 0,
      };

      setUploadTasks((prev) => ({ ...prev, [messageId]: initialTask }));

      const onProgress = (progressPercent: number) => {
        setUploadTasks((prev) => {
          if (!prev[messageId]) return prev;
          return {
            ...prev,
            [messageId]: {
              ...prev[messageId],
              progress: progressPercent,
            },
          };
        });
      };

      try {
        const uploadRes = await chatApi.uploadMedia(bookingId, localCompressedUri, 'image/jpeg', onProgress);
        const mediaUrl = uploadRes.media_url;

        setUploadTasks((prev) => {
          if (!prev[messageId]) return prev;
          return {
            ...prev,
            [messageId]: {
              ...prev[messageId],
              status: 'sent',
              progress: 100,
            },
          };
        });

        // Fire socket message with confirmed CDN media URL
        chatSocket.sendMessage({
          bookingId,
          type: 'image',
          content: content.trim() || 'Photo',
          mediaUrl,
          tempId: messageId,
        });

        return { success: true, mediaUrl };
      } catch (err) {
        setUploadTasks((prev) => {
          if (!prev[messageId]) return prev;
          return {
            ...prev,
            [messageId]: {
              ...prev[messageId],
              status: 'failed',
            },
          };
        });
        return { success: false, error: err };
      }
    },
    []
  );

  /**
   * Retries an upload using the cached compressed local URI without re-compressing
   */
  const retryUpload = useCallback(
    async (messageId: string, content: string = 'Photo') => {
      const task = tasksRef.current[messageId];
      if (!task) return;

      return uploadImage(messageId, task.bookingId, task.localCompressedUri, content);
    },
    [uploadImage]
  );

  const getProgress = useCallback((messageId: string): number => {
    return tasksRef.current[messageId]?.progress ?? 0;
  }, []);

  const getUploadStatus = useCallback((messageId: string): 'uploading' | 'sent' | 'failed' | undefined => {
    return tasksRef.current[messageId]?.status;
  }, []);

  return {
    uploadTasks,
    uploadImage,
    retryUpload,
    getProgress,
    getUploadStatus,
  };
}

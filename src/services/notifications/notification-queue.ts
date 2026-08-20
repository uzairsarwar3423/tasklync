/**
 * In-memory queue holding cold-start deep links until Expo Router has mounted its navigation tree.
 */
class NotificationQueue {
  private queue: string[] = [];

  /**
   * Adds a target path to the cold start queue.
   */
  enqueue(path: string): void {
    if (!path || !path.trim()) return;
    this.queue.push(path);
  }

  /**
   * Drains all queued paths once the navigation container is confirmed ready.
   */
  flush(navigateFn: (path: string) => void): void {
    if (this.queue.length === 0) return;
    const pathsToNavigate = [...this.queue];
    this.queue = [];

    // Navigate to the latest actionable path
    const latestPath = pathsToNavigate[pathsToNavigate.length - 1];
    if (latestPath) {
      setTimeout(() => {
        navigateFn(latestPath);
      }, 50);
    }
  }

  /**
   * Checks if there are pending paths waiting to be flushed.
   */
  hasPending(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Clears any pending navigation paths.
   */
  clear(): void {
    this.queue = [];
  }
}

export const notificationQueue = new NotificationQueue();

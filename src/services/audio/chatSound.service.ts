import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus } from 'expo-av';
import { Platform, AppState } from 'react-native';

// Sound assets required via Metro bundler
const SEND_SOUND_ASSET = require('../../../assets/sounds/send_message.mp3');
const RECEIVE_SOUND_ASSET = require('../../../assets/sounds/receive_message.mp3');

/**
 * Production-ready, thread-safe chat sound engine.
 * Solves Android JNI MediaPlayer/ExoPlayer concurrency crashes, race conditions,
 * state leaks, background execution violations, and unhandled promise rejections.
 */
class ChatSoundService {
  private sendSound: Audio.Sound | null = null;
  private receiveSound: Audio.Sound | null = null;
  private isAudioModeConfigured = false;
  private isPreloaded = false;
  private isEnabled = true;
  private isPreloading = false;

  // Web HTML5 Audio elements
  private webSendAudio: HTMLAudioElement | null = null;
  private webReceiveAudio: HTMLAudioElement | null = null;

  // Execution Queue (Async Mutex) to serialize native playback and prevent JNI races
  private playbackQueue: Promise<void> = Promise.resolve();

  // Deduplication & Throttling
  private playedMessageIds = new Map<string, number>(); // messageId -> timestamp
  private lastPlayedTime = 0;
  private readonly THROTTLE_MS = 250;
  private readonly DEDUP_TTL_MS = 1000 * 60 * 5; // 5 minutes TTL
  private readonly MAX_DEDUP_CACHE = 200;

  /**
   * Configures OS-level audio session attributes safely.
   */
  private async configureAudioMode(): Promise<void> {
    if (this.isAudioModeConfigured || Platform.OS === 'web') return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        playThroughEarpieceAndroid: false,
      });
      this.isAudioModeConfigured = true;
    } catch (error) {
      if (__DEV__) {
        console.warn('[ChatSoundService] Audio mode configuration notice:', error);
      }
    }
  }

  /**
   * Thread-safe preloading of sound assets into memory for 0ms instant playback.
   */
  public async ensurePreloaded(): Promise<void> {
    if (this.isPreloaded || this.isPreloading) return;
    this.isPreloading = true;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
          try {
            this.webSendAudio = new (window as any).Audio(SEND_SOUND_ASSET);
            this.webReceiveAudio = new (window as any).Audio(RECEIVE_SOUND_ASSET);
            if (this.webSendAudio) this.webSendAudio.preload = 'auto';
            if (this.webReceiveAudio) this.webReceiveAudio.preload = 'auto';
          } catch {}
        }
        this.isPreloaded = true;
        return;
      }

      await this.configureAudioMode();

      // Preload Send Sound safely
      if (!this.sendSound) {
        try {
          const { sound: sendObj } = await Audio.Sound.createAsync(
            SEND_SOUND_ASSET,
            { shouldPlay: false, volume: 0.85 },
            undefined,
            false
          );
          this.sendSound = sendObj;
        } catch (e) {
          if (__DEV__) {
            console.warn('[ChatSoundService] Send sound preload skipped:', e);
          }
        }
      }

      // Preload Receive Sound safely
      if (!this.receiveSound) {
        try {
          const { sound: receiveObj } = await Audio.Sound.createAsync(
            RECEIVE_SOUND_ASSET,
            { shouldPlay: false, volume: 0.95 },
            undefined,
            false
          );
          this.receiveSound = receiveObj;
        } catch (e) {
          if (__DEV__) {
            console.warn('[ChatSoundService] Receive sound preload skipped:', e);
          }
        }
      }

      this.isPreloaded = true;
    } catch (error) {
      if (__DEV__) {
        console.warn('[ChatSoundService] Preloading sound assets failed gracefully:', error);
      }
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Enqueues an audio task onto the serial execution queue.
   */
  private enqueueTask<T>(task: () => Promise<T>): Promise<T | void> {
    const nextPromise = this.playbackQueue
      .catch(() => {})
      .then(async () => {
        try {
          return await task();
        } catch (err) {
          if (__DEV__) {
            console.warn('[ChatSoundService] Enqueued audio task error:', err);
          }
        }
      });

    this.playbackQueue = nextPromise.then(() => {});
    return nextPromise;
  }

  /**
   * Helper to safely play a Sound instance with auto-rewind and recovery.
   */
  private async safePlaySound(
    soundRef: 'sendSound' | 'receiveSound',
    asset: any,
    volume: number
  ): Promise<void> {
    let sound = this[soundRef];

    // 1. If player already exists, check status and replay
    if (sound) {
      try {
        const status: AVPlaybackStatus = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setPositionAsync(0);
          await sound.setVolumeAsync(volume);
          await sound.playAsync();
          return;
        }
      } catch {
        // Status check or play failed, release reference safely
      }

      try {
        await sound.unloadAsync();
      } catch {}
      this[soundRef] = null;
    }

    // 2. Fresh instantiation if needed
    try {
      await this.configureAudioMode();
      const { sound: newSound } = await Audio.Sound.createAsync(
        asset,
        { shouldPlay: true, volume }
      );
      this[soundRef] = newSound;
    } catch (err) {
      if (__DEV__) {
        console.warn(`[ChatSoundService] Error creating sound instance for ${soundRef}:`, err);
      }
    }
  }

  /**
   * Toggle sound enabled/disabled state (respects user preferences).
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Plays send sound immediately when current user sends a message.
   * Completely fail-safe: never throws or crashes caller.
   */
  public playSendSound(): Promise<void> {
    if (!this.isEnabled) return Promise.resolve();

    // App state check: do not play sound if app is backgrounded
    if (Platform.OS !== 'web' && AppState.currentState !== 'active') {
      return Promise.resolve();
    }

    const now = Date.now();
    if (now - this.lastPlayedTime < this.THROTTLE_MS) return Promise.resolve();
    this.lastPlayedTime = now;

    if (Platform.OS === 'web') {
      try {
        if (this.webSendAudio) {
          this.webSendAudio.currentTime = 0;
          this.webSendAudio.play().catch(() => {});
        }
      } catch {}
      return Promise.resolve();
    }

    return this.enqueueTask(async () => {
      await this.safePlaySound('sendSound', SEND_SOUND_ASSET, 0.85);
    }) as Promise<void>;
  }

  /**
   * Plays receive sound when a message arrives from another user.
   * Includes sender check, deduplication, and app foreground state guard.
   * Completely fail-safe: never throws or crashes caller.
   */
  public playReceiveSound(
    messageId?: string,
    senderId?: string,
    currentUserId?: string
  ): Promise<void> {
    if (!this.isEnabled) return Promise.resolve();

    // 1. Never play receive sound for the current user's own sent/echoed messages
    if (senderId && currentUserId && String(senderId) === String(currentUserId)) {
      return Promise.resolve();
    }

    // 2. Foreground Check: Only play in-app sound when app is strictly active
    if (Platform.OS !== 'web' && AppState.currentState !== 'active') {
      return Promise.resolve();
    }

    const now = Date.now();

    // 3. Deduplication check: prevent playing twice for same message across socket/REST events
    if (messageId) {
      const cleanId = String(messageId).trim();
      const previousTimestamp = this.playedMessageIds.get(cleanId);
      if (previousTimestamp && now - previousTimestamp < this.DEDUP_TTL_MS) {
        return Promise.resolve();
      }
      this.recordPlayedMessageId(cleanId, now);
    }

    // 4. Throttle rapid concurrent sound bursts
    if (now - this.lastPlayedTime < this.THROTTLE_MS) return Promise.resolve();
    this.lastPlayedTime = now;

    if (Platform.OS === 'web') {
      try {
        if (this.webReceiveAudio) {
          this.webReceiveAudio.currentTime = 0;
          this.webReceiveAudio.play().catch(() => {});
        }
      } catch {}
      return Promise.resolve();
    }

    return this.enqueueTask(async () => {
      await this.safePlaySound('receiveSound', RECEIVE_SOUND_ASSET, 0.95);
    }) as Promise<void>;
  }

  /**
   * Manages deduplication cache size and cleans up stale items.
   */
  private recordPlayedMessageId(id: string, timestamp: number): void {
    if (this.playedMessageIds.size >= this.MAX_DEDUP_CACHE) {
      // Remove oldest or expired items
      const cutoff = timestamp - this.DEDUP_TTL_MS;
      for (const [key, time] of this.playedMessageIds.entries()) {
        if (time < cutoff || this.playedMessageIds.size >= this.MAX_DEDUP_CACHE) {
          this.playedMessageIds.delete(key);
        }
      }
    }
    this.playedMessageIds.set(id, timestamp);
  }

  /**
   * Unloads sound objects on application shutdown to prevent native memory leaks.
   */
  public async unload(): Promise<void> {
    return this.enqueueTask(async () => {
      try {
        if (this.sendSound) {
          await this.sendSound.unloadAsync();
          this.sendSound = null;
        }
        if (this.receiveSound) {
          await this.receiveSound.unloadAsync();
          this.receiveSound = null;
        }
        this.isPreloaded = false;
        this.isAudioModeConfigured = false;
      } catch {}
    }) as Promise<void>;
  }
}

export const chatSoundService = new ChatSoundService();


import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Platform, AppState } from 'react-native';

// Require sound assets (supports both mp3 and wav formats)
const SEND_SOUND_ASSET = require('../../../assets/sounds/send-message.mp3');
const RECEIVE_SOUND_ASSET = require('../../../assets/sounds/recieve-message.mp3');

class ChatSoundService {
  private sendSound: Audio.Sound | null = null;
  private receiveSound: Audio.Sound | null = null;
  private isAudioModeConfigured = false;
  private isPreloaded = false;
  private isEnabled = true;

  // Web Audio elements cache
  private webSendAudio: any = null;
  private webReceiveAudio: any = null;

  // Deduplication & Throttling
  private playedMessageIds = new Set<string>();
  private lastPlayedTime = 0;
  private readonly THROTTLE_MS = 150;
  private readonly MAX_DEDUP_SIZE = 150;

  constructor() {
    // Listen for AppState changes to manage audio lifecycle
    if (Platform.OS !== 'web') {
      AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          this.ensurePreloaded();
        }
      });
    }
  }

  /**
   * Configures OS-level audio session attributes (respects silent/DND switch).
   */
  private async configureAudioMode(): Promise<void> {
    if (this.isAudioModeConfigured || Platform.OS === 'web') return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false, // Respects hardware mute switch on iOS
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      });
      this.isAudioModeConfigured = true;
    } catch (error) {
      if (__DEV__) {
        console.warn('[ChatSoundService] Failed to set audio mode:', error);
      }
    }
  }

  /**
   * Preloads sound assets into memory for 0ms instantaneous playback.
   */
  public async ensurePreloaded(): Promise<void> {
    if (this.isPreloaded) return;

    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
          try {
            this.webSendAudio = new (window as any).Audio(SEND_SOUND_ASSET);
            this.webReceiveAudio = new (window as any).Audio(RECEIVE_SOUND_ASSET);
            this.webSendAudio.preload = 'auto';
            this.webReceiveAudio.preload = 'auto';
          } catch {}
        }
        this.isPreloaded = true;
        return;
      }

      await this.configureAudioMode();

      // Preload Send Sound
      if (!this.sendSound) {
        const { sound: sendObj } = await Audio.Sound.createAsync(
          SEND_SOUND_ASSET,
          { shouldPlay: false, volume: 0.85 },
          null,
          true
        );
        this.sendSound = sendObj;
      }

      // Preload Receive Sound
      if (!this.receiveSound) {
        const { sound: receiveObj } = await Audio.Sound.createAsync(
          RECEIVE_SOUND_ASSET,
          { shouldPlay: false, volume: 0.95 },
          null,
          true
        );
        this.receiveSound = receiveObj;
      }

      this.isPreloaded = true;
    } catch (error) {
      if (__DEV__) {
        console.warn('[ChatSoundService] Preloading sound assets failed:', error);
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
   */
  public async playSendSound(): Promise<void> {
    if (!this.isEnabled) return;

    const now = Date.now();
    if (now - this.lastPlayedTime < this.THROTTLE_MS) return;
    this.lastPlayedTime = now;

    try {
      if (Platform.OS === 'web') {
        if (this.webSendAudio) {
          this.webSendAudio.currentTime = 0;
          this.webSendAudio.play().catch(() => {});
        }
        return;
      }

      if (!this.sendSound) {
        await this.ensurePreloaded();
      }

      if (this.sendSound) {
        await this.sendSound.replayAsync();
      }
    } catch {
      // Fallback reload if sound instance was released by OS
      try {
        const { sound } = await Audio.Sound.createAsync(
          SEND_SOUND_ASSET,
          { shouldPlay: true, volume: 0.85 }
        );
        this.sendSound = sound;
      } catch {}
    }
  }

  /**
   * Plays receive sound when a message arrives from another user.
   * Includes sender check, deduplication, and app foreground state guard.
   */
  public async playReceiveSound(
    messageId?: string,
    senderId?: string,
    currentUserId?: string
  ): Promise<void> {
    if (!this.isEnabled) return;

    // 1. Never play receive sound for the current user's own sent/echoed messages
    if (senderId && currentUserId && senderId === currentUserId) {
      return;
    }

    // 2. Deduplication check: prevent playing twice for same message across socket/REST events
    if (messageId) {
      if (this.playedMessageIds.has(messageId)) {
        return;
      }
      this.addPlayedMessageId(messageId);
    }

    // 3. Foreground Check: Only play in-app sound when app is in active foreground
    if (Platform.OS !== 'web' && AppState.currentState !== 'active') {
      return;
    }

    // 4. Throttle rapid concurrent sound bursts
    const now = Date.now();
    if (now - this.lastPlayedTime < this.THROTTLE_MS) return;
    this.lastPlayedTime = now;

    try {
      if (Platform.OS === 'web') {
        if (this.webReceiveAudio) {
          this.webReceiveAudio.currentTime = 0;
          this.webReceiveAudio.play().catch(() => {});
        }
        return;
      }

      if (!this.receiveSound) {
        await this.ensurePreloaded();
      }

      if (this.receiveSound) {
        await this.receiveSound.replayAsync();
      }
    } catch {
      try {
        const { sound } = await Audio.Sound.createAsync(
          RECEIVE_SOUND_ASSET,
          { shouldPlay: true, volume: 0.95 }
        );
        this.receiveSound = sound;
      } catch {}
    }
  }

  /**
   * Manages deduplication cache size.
   */
  private addPlayedMessageId(id: string): void {
    if (this.playedMessageIds.size >= this.MAX_DEDUP_SIZE) {
      const firstItem = this.playedMessageIds.values().next().value;
      if (firstItem) {
        this.playedMessageIds.delete(firstItem);
      }
    }
    this.playedMessageIds.add(id);
  }

  /**
   * Unloads sound objects on application shutdown to prevent native memory leaks.
   */
  public async unload(): Promise<void> {
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
    } catch {}
  }
}

export const chatSoundService = new ChatSoundService();

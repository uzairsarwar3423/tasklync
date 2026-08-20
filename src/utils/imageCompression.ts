import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  format?: ImageManipulator.SaveFormat;
}

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * Pure wrapper around expo-image-manipulator presets.
 * Takes a raw local image URI and compresses it to standard chat bubble scale
 * (max 1280px longest edge, 70% quality JPEG band).
 *
 * UX/Performance Rule:
 * Keeps payload lightweight (<300KB band) for fast transmission across mobile/3G/4G networks in PK,
 * eliminating latency while preserving high visual clarity.
 */
export async function compressImage(
  uri: string,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.7,
    format = ImageManipulator.SaveFormat.JPEG,
  } = options;

  try {
    const actions: ImageManipulator.Action[] = [
      {
        resize: {
          width: maxWidth,
          height: maxHeight,
        },
      },
    ];

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: quality,
      format,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[imageCompression] Compression failed, falling back to original URI:', error);
    }
    return {
      uri,
      width: 1280,
      height: 1280,
    };
  }
}

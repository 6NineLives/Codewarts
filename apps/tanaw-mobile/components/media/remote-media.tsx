import { Video, ResizeMode } from 'expo-av';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import type { RemoteMediaFormat } from '@/config/media.types';

type RemoteMediaProps = {
  uri: string;
  format: RemoteMediaFormat;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain';
  loopVideo?: boolean;
  /** 1 = fit, 1.5 = 50% more zoom-in (cropped by parent overflow). */
  zoom?: number;
};

export function RemoteMedia({
  uri,
  format,
  style,
  imageStyle,
  resizeMode = 'cover',
  loopVideo = true,
  zoom = 1,
}: RemoteMediaProps) {
  const zoomStyle = zoom !== 1 ? { transform: [{ scale: zoom }] as const } : undefined;

  if (format === 'video') {
    return (
      <View style={[style, styles.zoomClip]}>
        <Video
          key={uri}
          source={{ uri }}
          style={[StyleSheet.absoluteFill, imageStyle, zoomStyle]}
          resizeMode={resizeMode === 'cover' ? ResizeMode.COVER : ResizeMode.CONTAIN}
          isLooping={loopVideo}
          isMuted
          shouldPlay
        />
      </View>
    );
  }

  return (
    <View style={[style, styles.zoomClip]}>
      <Image
        source={{ uri }}
        style={[imageStyle ?? StyleSheet.absoluteFillObject, zoomStyle]}
        resizeMode={resizeMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  zoomClip: {
    overflow: 'hidden',
  },
});

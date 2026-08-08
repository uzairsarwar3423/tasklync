import { FC } from 'react';
import { Circle } from 'react-native-maps';
import { Coordinates } from '../../types/location.types';

interface RadiusCircleProps {
  center: Coordinates | null;
  radiusMeters?: number; // default 5000 (5km)
}

export const RadiusCircle: FC<RadiusCircleProps> = ({
  center,
  radiusMeters = 5000,
}) => {
  if (!center || !center.lat || !center.lng) {
    return null;
  }

  return (
    <Circle
      center={{
        latitude: center.lat,
        longitude: center.lng,
      }}
      radius={radiusMeters}
      fillColor="rgba(34, 197, 94, 0.08)"
      strokeColor="rgba(34, 197, 94, 0.35)"
      strokeWidth={1.5}
      zIndex={1}
    />
  );
};

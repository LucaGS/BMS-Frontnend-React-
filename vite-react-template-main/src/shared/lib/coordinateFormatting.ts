const DEFAULT_COORDINATE_DECIMALS = 4;

export const formatCoordinateDisplay = (
  value?: number | null,
  fallback = 'n/v',
  decimals = DEFAULT_COORDINATE_DECIMALS,
) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return value.toFixed(decimals);
};

export const formatCoordinatePairDisplay = (
  latitude?: number | null,
  longitude?: number | null,
  fallback = 'Keine Koordinaten',
  decimals = DEFAULT_COORDINATE_DECIMALS,
) => {
  if (
    typeof latitude !== 'number' ||
    Number.isNaN(latitude) ||
    typeof longitude !== 'number' ||
    Number.isNaN(longitude)
  ) {
    return fallback;
  }

  return `${formatCoordinateDisplay(latitude, 'n/v', decimals)}, ${formatCoordinateDisplay(longitude, 'n/v', decimals)}`;
};
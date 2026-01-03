import { hasValidCoordinates } from './leafletUtils';

export type MapPreviewPoint = {
  id: number | string;
  number?: number | null;
  label?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

/**
 * Creates a simple schematic map preview as PNG data URL that can be used in PDFs.
 */
const MIN_RANGE = 0.002;

export const buildMapPreviewDataUrl = (
  points: MapPreviewPoint[],
  center: [number, number],
): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const validPoints = points
    .filter((point) => hasValidCoordinates(point.latitude, point.longitude, { allowZero: false }))
    .map((point) => ({
      id: point.id,
      number: point.label ?? point.number ?? point.id,
      latitude: point.latitude as number,
      longitude: point.longitude as number,
    }));

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const padding = 36;
  const usableWidth = canvas.width - padding * 2;
  const usableHeight = canvas.height - padding * 2;

  const latitudes = validPoints.map((point) => point.latitude);
  const longitudes = validPoints.map((point) => point.longitude);
  latitudes.push(center[0]);
  longitudes.push(center[1]);

  const minLatRaw = Math.min(...latitudes);
  const maxLatRaw = Math.max(...latitudes);
  const minLngRaw = Math.min(...longitudes);
  const maxLngRaw = Math.max(...longitudes);

  const latRange = Math.max(maxLatRaw - minLatRaw, MIN_RANGE);
  const lngRange = Math.max(maxLngRaw - minLngRaw, MIN_RANGE);

  const minLat = latRange === MIN_RANGE ? center[0] - latRange / 2 : minLatRaw;
  const minLng = lngRange === MIN_RANGE ? center[1] - lngRange / 2 : minLngRaw;

  const toPoint = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / lngRange) * usableWidth;
    const y = canvas.height - (padding + ((lat - minLat) / latRange) * usableHeight);
    return { x, y };
  };

  const background = ctx.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#f7fbf5');
  background.addColorStop(1, '#e8f2e6');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(12, 94, 46, 0.14)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  for (let i = 1; i < 4; i += 1) {
    const x = padding + (usableWidth / 4) * i;
    const y = padding + (usableHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, canvas.height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const centerPoint = toPoint(center[0], center[1]);
  ctx.strokeStyle = '#0b5c2d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerPoint.x, centerPoint.y, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerPoint.x - 12, centerPoint.y);
  ctx.lineTo(centerPoint.x + 12, centerPoint.y);
  ctx.moveTo(centerPoint.x, centerPoint.y - 12);
  ctx.lineTo(centerPoint.x, centerPoint.y + 12);
  ctx.stroke();

  validPoints.forEach((point) => {
    const { x, y } = toPoint(point.latitude, point.longitude);
    ctx.fillStyle = '#0a6b30';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(point.number), x, y);
  });

  ctx.fillStyle = '#0b5c2d';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Schematische Kartenansicht', padding, padding - 20);

  return canvas.toDataURL('image/png');
};

export const buildTreeMapPreviewDataUrl = (
  tree: MapPreviewPoint,
  fallbackCenter: [number, number],
): string | null => {
  const coordsAreValid = hasValidCoordinates(tree.latitude, tree.longitude, { allowZero: false });
  const center: [number, number] = coordsAreValid
    ? [tree.latitude as number, tree.longitude as number]
    : fallbackCenter;
  return buildMapPreviewDataUrl([tree], center);
};

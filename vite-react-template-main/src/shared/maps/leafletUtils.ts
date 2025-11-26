export interface LeafletWindow extends Window {
  L?: any;
}

const LEAFLET_SCRIPT_ID = 'leaflet-script';
const LEAFLET_CSS_ID = 'leaflet-css';

export const DEFAULT_MAP_CENTER: [number, number] = [49.6590, 8.9962];
export const DEFAULT_MAP_ZOOM = 16;
export const MAX_MAP_ZOOM = 21;

export const hasValidCoordinates = (
  latitude?: number | null,
  longitude?: number | null,
  { allowZero = true }: { allowZero?: boolean } = {},
): boolean => {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return false;
  }

  if (!allowZero && latitude === 0 && longitude === 0) {
    return false;
  }

  return true;
};

export const ensureLeafletAssets = (): Promise<void> => {
  // During unit tests we do not need to load remote Leaflet assets
  const isVitest =
    (typeof import.meta !== 'undefined' && (import.meta as any).vitest) ||
    (typeof process !== 'undefined' && Boolean(process.env?.VITEST));
  if (isVitest) {
    return Promise.resolve();
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }

  const leafletWindow = window as LeafletWindow;
  if (leafletWindow.L) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const handleResolve = () => resolve();
    const handleReject = () => reject(new Error('Leaflet konnte nicht geladen werden.'));

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', handleResolve, { once: true });
      existingScript.addEventListener('error', handleReject, { once: true });
      return;
    }

    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const cssLink = document.createElement('link');
      cssLink.id = LEAFLET_CSS_ID;
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    const script = document.createElement('script');
    script.id = LEAFLET_SCRIPT_ID;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = handleResolve;
    script.onerror = handleReject;
    document.body.appendChild(script);
  });
};

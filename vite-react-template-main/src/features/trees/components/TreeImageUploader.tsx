import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';
import { authFetch } from '@/shared/lib/auth';

type TreeImage = {
  id: string;
  url: string;
  canDelete: boolean;
};

type TreeImageUploaderProps = {
  treeId: number;
};

const IMAGE_UPLOAD_MAX_DIMENSION = 1800;
const IMAGE_UPLOAD_INITIAL_QUALITY = 0.82;
const IMAGE_UPLOAD_MIN_QUALITY = 0.58;
const IMAGE_UPLOAD_TARGET_BYTES = 1_200_000;

type PreparedUploadImage = {
  fileName: string;
  contentType: string;
  data: string;
  previewUrl: string;
  sizeBytes: number;
  originalSizeBytes: number;
};

const normalizeImagePayload = (payload: unknown): TreeImage[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item) {
          return null;
        }
        if (typeof item === 'string') {
          return { id: item, url: item, canDelete: false };
        }
        if (typeof item === 'object') {
          const { url, imageUrl, path, data, contentType, id, imageId } = item as Record<string, unknown>;
          const resolvedUrl =
            typeof url === 'string'
              ? url
              : typeof imageUrl === 'string'
                ? imageUrl
                : typeof path === 'string'
                  ? path.startsWith('http')
                    ? path
                    : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
                  : typeof data === 'string' && data.length > 0
                    ? (() => {
                        const type =
                          typeof contentType === 'string' && contentType.trim().length > 0
                            ? contentType
                            : 'image/jpeg';
                        return `data:${type};base64,${data}`;
                      })()
                    : null;
          if (!resolvedUrl) {
            return null;
          }
          const resolvedId = (typeof id === 'number' || typeof id === 'string'
            ? id
            : typeof imageId === 'number' || typeof imageId === 'string'
              ? imageId
              : null) as string | number | null;
          return {
            id: String(resolvedId ?? resolvedUrl),
            url: resolvedUrl,
            canDelete: resolvedId != null,
          };
        }
        return null;
      })
      .filter((entry): entry is TreeImage => Boolean(entry));
  }

  if (typeof payload === 'string') {
    return [{ id: payload, url: payload, canDelete: false }];
  }

  return [];
};

const TreeImageUploader: React.FC<TreeImageUploaderProps> = ({ treeId }) => {
  const [preparedImage, setPreparedImage] = useState<PreparedUploadImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<TreeImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const revokePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  useEffect(() => () => revokePreview(), [previewUrl]);

  const fetchImages = useCallback(async () => {
    if (!treeId) {
      setUploadedImages([]);
      return;
    }

    setIsLoadingImages(true);
    setMessage(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/api/Images/GetImages/${treeId}`);

      if (!response.ok) {
        throw new Error('Failed to load images');
      }

      const payload = await response.json();
      const normalized = normalizeImagePayload(payload);
      setUploadedImages(normalized);
    } catch (error) {
      console.error('Error loading tree images:', error);
      setUploadedImages([]);
      setMessage({ kind: 'error', text: 'Vorhandene Bilder konnten nicht geladen werden.' });
    } finally {
      setIsLoadingImages(false);
    }
  }, [treeId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (uploadedImages.length === 0) {
      setSelectedImageId(null);
      return;
    }

    setSelectedImageId((currentSelected) => {
      if (currentSelected && uploadedImages.some((image) => image.id === currentSelected)) {
        return currentSelected;
      }
      return uploadedImages[uploadedImages.length - 1].id;
    });
  }, [uploadedImages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    revokePreview();
    setMessage(null);

    if (!file) {
      setPreparedImage(null);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPreparedImage(null);
      setPreviewUrl(null);
      setMessage({ kind: 'error', text: 'Bitte wählen Sie eine gültige Bilddatei.' });
      return;
    }

    void prepareUploadImage(file)
      .then((prepared) => {
        setPreparedImage(prepared);
        setPreviewUrl(prepared.previewUrl);
      })
      .catch((error) => {
        console.error('Error preparing image for upload:', error);
        setPreparedImage(null);
        setPreviewUrl(null);
        setMessage({ kind: 'error', text: 'Bild konnte nicht verarbeitet werden.' });
      });
  };

  const resetSelection = () => {
    revokePreview();
    setPreparedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataUrl = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Invalid data URL result'));
          return;
        }
        resolve(reader.result);
      };
      reader.onerror = (event) => reject(event);
      reader.readAsDataURL(file);
    });

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (event) => reject(event);
      image.src = src;
    });

  const blobToBase64 = async (blob: Blob) => {
    const dataUrl = await readFileAsDataUrl(blob);
    return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  };

  const compressImage = async (file: File): Promise<PreparedUploadImage> => {
    const sourceUrl = await readFileAsDataUrl(file);
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement('canvas');
    const longestSide = Math.max(image.width, image.height);
    const scale = longestSide > IMAGE_UPLOAD_MAX_DIMENSION ? IMAGE_UPLOAD_MAX_DIMENSION / longestSide : 1;
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context unavailable');
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    let quality = IMAGE_UPLOAD_INITIAL_QUALITY;
    let compressedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

    while (compressedBlob && compressedBlob.size > IMAGE_UPLOAD_TARGET_BYTES && quality > IMAGE_UPLOAD_MIN_QUALITY) {
      quality = Math.max(IMAGE_UPLOAD_MIN_QUALITY, quality - 0.08);
      compressedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    }

    if (!compressedBlob) {
      throw new Error('Image compression failed');
    }

    const preview = URL.createObjectURL(compressedBlob);
    return {
      fileName: file.name.replace(/\.[^.]+$/, '.jpg'),
      contentType: 'image/jpeg',
      data: await blobToBase64(compressedBlob),
      previewUrl: preview,
      sizeBytes: compressedBlob.size,
      originalSizeBytes: file.size,
    };
  };

  const prepareUploadImage = async (file: File): Promise<PreparedUploadImage> => compressImage(file);

  const handleUpload = async () => {
    if (!preparedImage) {
      setMessage({ kind: 'error', text: 'Bitte wählen Sie zuerst eine Bilddatei aus.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const payload = {
        treeId,
        fileName: preparedImage.fileName,
        contentType: preparedImage.contentType,
        data: preparedImage.data,
      };

      const response = await authFetch(`${API_BASE_URL}/api/Images/CreateImage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await fetchImages();
      setMessage({ kind: 'success', text: 'Bild erfolgreich hochgeladen.' });
      resetSelection();
    } catch (error) {
      console.error('Error uploading tree image:', error);
      setMessage({ kind: 'error', text: 'Bild konnte nicht hochgeladen werden.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (image: TreeImage) => {
    if (!image.canDelete) {
      setMessage({ kind: 'error', text: 'Dieses Bild kann nicht gelöscht werden (keine ID vorhanden).' });
      return;
    }
    const confirmed = window.confirm('Dieses Bild wirklich löschen?');
    if (!confirmed) {
      return;
    }
    try {
      const response = await authFetch(`${API_BASE_URL}/api/Images/${image.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      await fetchImages();
      setMessage({ kind: 'success', text: 'Bild wurde gelöscht.' });
    } catch (error) {
      console.error('Error deleting tree image:', error);
      setMessage({ kind: 'error', text: 'Bild konnte nicht gelöscht werden.' });
    }
  };

  const activeImage = selectedImageId
    ? uploadedImages.find((image) => image.id === selectedImageId) ?? null
    : null;
  const activeIndex = activeImage ? uploadedImages.findIndex((image) => image.id === activeImage.id) : -1;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex >= 0 && activeIndex < uploadedImages.length - 1;

  return (
    <section className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h5 mb-0">Baumbilder</h2>
        <span className="badge bg-light text-dark">{uploadedImages.length}</span>
      </div>
      <p className="text-muted small mb-3">
        Laden Sie aussagekraeftige Bilder hoch, um den Zustand des Baumes zu dokumentieren.
      </p>
      <div className="border rounded-3 p-3 bg-light mb-4">
        <label htmlFor="tree-image-upload" className="form-label">
          Neues Bild hochladen
        </label>
        <input
          ref={fileInputRef}
          type="file"
          className="form-control"
          id="tree-image-upload"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {previewUrl && (
          <div className="mt-3">
            <div className="ratio ratio-16x9 rounded border overflow-hidden">
              <img src={previewUrl} alt="Bildvorschau" style={{ objectFit: 'cover' }} />
            </div>
            {preparedImage && (
              <div className="small text-muted mt-2">
                Komprimiert von {Math.round(preparedImage.originalSizeBytes / 1024)} KB auf {Math.round(preparedImage.sizeBytes / 1024)} KB.
              </div>
            )}
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={resetSelection}
                disabled={isUploading}
              >
                Auswahl entfernen
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleUpload}
                disabled={isUploading || !preparedImage}
              >
                {isUploading ? 'Wird hochgeladen...' : 'Jetzt hochladen'}
              </button>
            </div>
          </div>
        )}
        {!previewUrl && (
          <button
            type="button"
            className="btn btn-primary btn-sm mt-3"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Bild aus Dateien wählen
          </button>
        )}
        {message && (
          <div
            className={`alert mt-3 mb-0 ${message.kind === 'error' ? 'alert-danger' : 'alert-success'}`}
            role="alert"
          >
            {message.text}
          </div>
        )}
      </div>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="h6 mb-0">Hochgeladene Bilder</h3>
          {isLoadingImages && <span className="text-muted small">Wird geladen...</span>}
        </div>
        {uploadedImages.length === 0 && !isLoadingImages && (
          <p className="text-muted small mb-0">Noch keine Bilder vorhanden.</p>
        )}
        {uploadedImages.length > 0 && (
          <div className="p-3 border rounded-4 bg-white shadow-sm">
            <div className="ratio ratio-4x3 rounded-4 overflow-hidden position-relative bg-secondary bg-opacity-10 mb-2">
              {activeImage ? (
                <img src={activeImage.url} alt="Ausgewähltes Baumbild" className="w-100 h-100" style={{ objectFit: 'cover' }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small">Bild wird geladen...</div>
              )}
              {activeImage && (
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)' }}
                >
                  <div className="text-white small fw-semibold">
                    Bild {activeIndex + 1} von {uploadedImages.length}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => setSelectedImageId(canGoPrev ? uploadedImages[activeIndex - 1].id : activeImage.id)}
                      disabled={!canGoPrev}
                    >
                      Zurück
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => setSelectedImageId(canGoNext ? uploadedImages[activeIndex + 1].id : activeImage.id)}
                      disabled={!canGoNext}
                    >
                      Weiter
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(activeImage)}
                      disabled={isLoadingImages || !activeImage.canDelete}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
            {uploadedImages.length > 1 && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Weitere Bilder anklicken, um sie anzusehen</span>
                  <span className="badge bg-light text-dark">{uploadedImages.length}</span>
                </div>
                <div className="d-flex gap-2 overflow-auto pb-1">
                  {uploadedImages.map((image) => {
                    const isActive = image.id === activeImage?.id;
                    return (
                      <button
                        type="button"
                        key={image.id}
                        onClick={() => setSelectedImageId(image.id)}
                        className={`p-1 rounded-3 border ${isActive ? 'border-primary shadow-sm' : 'border-0'} bg-transparent`}
                        style={{ minWidth: '104px', maxWidth: '128px' }}
                        aria-label="Baumbild auswählen"
                      >
                        <div className={`ratio ratio-4x3 rounded-2 overflow-hidden ${isActive ? 'bg-primary bg-opacity-10' : 'bg-light'}`}>
                          <img src={image.url} alt="Vorschau Baumbild" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TreeImageUploader;

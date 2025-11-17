import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';

type TreeImage = {
  id: string;
  url: string;
};

type TreeImageUploaderProps = {
  treeId: number;
};

const ensureAbsoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = value.replace(/^\//, '');
  return `${base}/${path}`;
};

const mapToImage = (input: unknown): TreeImage | null => {
  if (!input) {
    return null;
  }

  if (typeof input === 'string') {
    const url = ensureAbsoluteUrl(input);
    return { id: url, url };
  }

  if (typeof input === 'object') {
    const candidate = input as Record<string, unknown>;
    const { id, url, imageUrl, path, data, contentType } = candidate;

    if (typeof url === 'string') {
      return { id: String(id ?? url), url: ensureAbsoluteUrl(url) };
    }
    if (typeof imageUrl === 'string') {
      return { id: String(id ?? imageUrl), url: ensureAbsoluteUrl(imageUrl) };
    }
    if (typeof path === 'string') {
      return { id: String(id ?? path), url: ensureAbsoluteUrl(path) };
    }
    if (typeof data === 'string' && data.length > 0) {
      const type = typeof contentType === 'string' && contentType.length > 0 ? contentType : 'image/png';
      return {
        id: String(id ?? `${Date.now()}-${Math.random()}`),
        url: `data:${type};base64,${data}`,
      };
    }
  }

  return null;
};

const parseImageResponse = (payload: unknown): TreeImage[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload.map(mapToImage).filter((image): image is TreeImage => Boolean(image));
  }

  const single = mapToImage(payload);
  return single ? [single] : [];
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (event) => {
      reject(event);
    };
    reader.readAsDataURL(file);
  });

const TreeImageUploader: React.FC<TreeImageUploaderProps> = ({ treeId }) => {
  const [images, setImages] = useState<TreeImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const revokePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  useEffect(
    () => () => {
      revokePreview();
    },
    [previewUrl],
  );

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/TreeImages/ByTreeId/${treeId}`, {
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tree images.');
      }
      const payload = await response.json();
      setImages(parseImageResponse(payload));
    } catch (error) {
      console.error('Error loading tree images:', error);
      setImages([]);
      setFeedback({ type: 'error', text: 'Bilder konnten nicht geladen werden.' });
    } finally {
      setIsLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    if (treeId) {
      loadImages();
    }
  }, [treeId, loadImages]);

  const resetSelection = () => {
    revokePreview();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFeedback(null);
    revokePreview();

    if (!file) {
      resetSelection();
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Bitte waehlen Sie eine gueltige Bilddatei aus.' });
      resetSelection();
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setFeedback({ type: 'error', text: 'Bitte zuerst ein Bild auswaehlen.' });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const base64 = await fileToBase64(selectedFile);
      const payload = {
        treeId,
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        data: base64,
      };

      const response = await fetch(`${API_BASE_URL}/api/TreeImages/Create`, {
        method: 'POST',
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await loadImages();
      setFeedback({ type: 'success', text: 'Bild erfolgreich hochgeladen.' });
      resetSelection();
    } catch (error) {
      console.error('Error uploading tree image:', error);
      setFeedback({ type: 'error', text: 'Bild konnte nicht hochgeladen werden.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mt-4 pt-4 border-top">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1">Baumbilder</h2>
          <p className="text-muted small mb-0">
            Dokumentieren Sie den Zustand des Baumes mit aktuellen Fotos.
          </p>
        </div>
        <span className="badge bg-light text-dark align-self-center">{images.length} Bilder</span>
      </div>
      <div className="row gy-4">
        <div className="col-12 col-lg-5">
          <div className="border rounded-3 p-3 h-100 bg-light">
            <form onSubmit={handleUpload} className="d-flex flex-column gap-3">
              <div>
                <label htmlFor="tree-image-upload" className="form-label mb-2">
                  Bild auswaehlen
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  id="tree-image-upload"
                  accept="image/*"
                  onChange={handleFileSelection}
                  disabled={isUploading}
                />
              </div>
              {previewUrl && (
                <div className="rounded border overflow-hidden ratio ratio-4x3">
                  <img src={previewUrl} alt="Bildvorschau" style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={resetSelection}
                  disabled={isUploading && !previewUrl}
                >
                  Auswahl entfernen
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Wird hochgeladen...' : 'Bild hochladen'}
                </button>
              </div>
              {feedback && (
                <div
                  className={`alert mb-0 ${
                    feedback.type === 'error' ? 'alert-danger' : 'alert-success'
                  }`}
                  role="alert"
                >
                  {feedback.text}
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="col-12 col-lg-7">
          <div className="border rounded-3 p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 mb-0">Hochgeladene Bilder</h3>
              {isLoading && <span className="text-muted small">Wird geladen...</span>}
            </div>
            {!isLoading && images.length === 0 && (
              <p className="text-muted small mb-0">Noch keine Bilder vorhanden.</p>
            )}
            {images.length > 0 && (
              <div className="row g-3">
                {images.map((image) => (
                  <div key={image.id} className="col-12 col-sm-6">
                    <div className="ratio ratio-4x3 rounded border overflow-hidden bg-white shadow-sm">
                      <img src={image.url} alt="Baumbild" style={{ objectFit: 'cover' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TreeImageUploader;

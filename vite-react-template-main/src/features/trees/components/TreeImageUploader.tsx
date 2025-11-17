import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/shared/config/appConfig';

type TreeImage = {
  id: string;
  url: string;
};

type TreeImageUploaderProps = {
  treeId: number;
};

const normalizeImagePayload = (payload: unknown): string[] => {
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
          return item;
        }
        if (typeof item === 'object') {
          const { url, imageUrl, path } = item as Record<string, unknown>;
          if (typeof url === 'string') {
            return url;
          }
          if (typeof imageUrl === 'string') {
            return imageUrl;
          }
          if (typeof path === 'string') {
            return path.startsWith('http')
              ? path
              : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
          }
        }
        return null;
      })
      .filter((url): url is string => Boolean(url));
  }

  if (typeof payload === 'string') {
    return [payload];
  }

  return [];
};

const TreeImageUploader: React.FC<TreeImageUploaderProps> = ({ treeId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<TreeImage[]>([]);
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
      const response = await fetch(`${API_BASE_URL}/api/TreeImages/ByTreeId/${treeId}`, {
        headers: {
          Authorization: `bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load images');
      }

      const payload = await response.json();
      const normalized = normalizeImagePayload(payload).map<TreeImage>((url) => ({
        id: crypto.randomUUID?.() ?? `${url}-${Date.now()}`,
        url,
      }));
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    revokePreview();
    setMessage(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage({ kind: 'error', text: 'Bitte waehlen Sie eine gueltige Bilddatei.' });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const resetSelection = () => {
    revokePreview();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const encodeFileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (event) => reject(event);
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ kind: 'error', text: 'Bitte waehlen Sie zuerst eine Bilddatei aus.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const base64Data = await encodeFileToBase64(selectedFile);
      const payload = {
        treeId,
        fileName: selectedFile.name,
        contentType: selectedFile.type,
        data: base64Data,
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
                disabled={isUploading}
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
            Bild aus Dateien waehlen
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
          <div className="row g-3">
            {uploadedImages.map((image) => (
              <div key={image.id} className="col-12 col-sm-6">
                <div className="ratio ratio-4x3 rounded border overflow-hidden bg-white">
                  <img src={image.url} alt="Baumbild" style={{ objectFit: 'cover' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TreeImageUploader;

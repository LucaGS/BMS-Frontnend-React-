import React, { useEffect, useRef, useState } from "react";

interface GruenFlaeche {
  id: number;
  name: string;
  kundenName: string;
  imgBlob: Blob | null;
  previewUrl?: string;
}

const MAX_MB = 5;

const GruenFlaechenAdder: React.FC = () => {
  const [gruenFlaechen, setGruenFlaechen] = useState<GruenFlaeche[]>([]);
  const [name, setName] = useState("");
  const [kundenName, setKundename] = useState("");
  const [imgBlob, setImgBlob] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  // Merke den aktuell aktiven ObjectURL, damit wir ihn sicher revoken können.
  const previewRef = useRef<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    // alten URL (falls vorhanden) zuerst freigeben
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    if (!file) {
      setImgBlob(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Bitte ein Bild auswählen.");
      e.currentTarget.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setStatus(`Max. ${MAX_MB} MB überschritten.`);
      e.currentTarget.value = "";
      return;
    }

    setImgBlob(file);
    const url = URL.createObjectURL(file);
    previewRef.current = url; // merke den aktuellen
    setPreviewUrl(url);
    setStatus("");
  }

  // nur beim Unmount aufräumen (kein StrictMode-Bug)
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  async function handleAdd() {
    if (!name.trim()) return setStatus("Name fehlt.");
    if (!kundenName.trim()) return setStatus("Kundenname fehlt.");

    try {
      setStatus("Lade hoch…");
      const form = new FormData();
      form.append("name", name);
      form.append("kundenName", kundenName);
      if (imgBlob) form.append("image", imgBlob, imgBlob.name);

      const res = await fetch("/api/gruenflaechen", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.text()) || "Upload fehlgeschlagen");
      const created = await res.json();

      setGruenFlaechen((prev) => [
        ...prev,
        {
          id: created.id ?? Date.now(),
          name,
          kundenName,
          imgBlob: imgBlob ?? null,
          previewUrl: previewUrl ?? undefined,
        },
      ]);

      // Felder leeren + Preview-URL freigeben
      setName("");
      setKundename("");
      setImgBlob(null);
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
      }
      setPreviewUrl(null);
      setStatus("Fertig!");
    } catch (e: any) {
      setStatus(e.message ?? "Fehler beim Speichern.");
    }
  }

  return (
    <div>
      <h2>Grünflächen hinzufügen</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Name der Grünfläche"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Kunden Name"
          value={kundenName}
          onChange={(e) => setKundename(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} title="Karte der Grünanlage" />
        <button onClick={handleAdd}>Hinzufügen</button>
      </div>

      {previewUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <img src={previewUrl} alt="Vorschau" style={{ maxWidth: 240, display: "block" }} />
        </div>
      )}

      <p>{status}</p>

      <ul>
        {gruenFlaechen.map((gf) => (
          <li key={gf.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>
              {gf.name} – {gf.kundenName}
            </span>
            {gf.previewUrl && (
              <img
                src={gf.previewUrl}
                alt={`${gf.name} preview`}
                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GruenFlaechenAdder;

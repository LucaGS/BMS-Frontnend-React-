import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import TreeImageUploader from '../TreeImageUploader';

const fetchMock = vi.spyOn(globalThis, 'fetch');

class FileReaderMock {
  result: string | ArrayBuffer | null = null;
  onload: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  readAsDataURL(file?: Blob) {
    this.result = file?.type === 'image/jpeg'
      ? 'data:image/jpeg;base64,Y29tcHJlc3NlZA=='
      : 'data:image/png;base64,ZmFrZQ==';
    this.onload?.({ target: { result: this.result } });
  }
}

describe('TreeImageUploader', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('FileReader', FileReaderMock as any);
    vi.stubGlobal(
      'Image',
      class {
        width = 2400;
        height = 1600;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onload?.();
        }
      } as any,
    );

    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName.toLowerCase() === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: vi.fn() }),
          toBlob: (callback: (blob: Blob) => void) => callback(new Blob(['compressed'], { type: 'image/jpeg' })),
        } as unknown as HTMLCanvasElement;
      }

      return Document.prototype.createElement.call(document, tagName);
    }) as typeof document.createElement);
  });

  it('shows a validation error for non-image files', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<TreeImageUploader treeId={1} />);

    const fileInput = screen.getByLabelText(/neues bild hochladen/i) as HTMLInputElement;
    const badFile = new File(['data'], 'document.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      await screen.findByText(/bitte wählen sie eine gültige bilddatei/i)
    ).toBeInTheDocument();
  });

  it('uploads a selected image and refreshes the gallery', async () => {
    // First call: load existing images. Second call: upload. Third call: refresh images.
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ url: 'https://example.com/tree.jpg' }]), { status: 200 })
      );

    render(<TreeImageUploader treeId={5} />);

    const fileInput = await screen.findByLabelText(/neues bild hochladen/i);
    const imageFile = new File(['data'], 'tree.png', { type: 'image/png' });

    await userEvent.upload(fileInput, imageFile);

    const uploadButton = await screen.findByRole('button', { name: /jetzt hochladen/i });
    await userEvent.click(uploadButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/Images/CreateImage');
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ method: 'POST' });
    expect(fetchMock.mock.calls[1]?.[1]?.body).toContain('image/jpeg');
    expect(fetchMock.mock.calls[1]?.[1]?.body).toContain('Y29tcHJlc3NlZA==');
    expect(await screen.findByRole('alert')).toHaveTextContent(/erfolgreich hochgeladen/i);
    expect(screen.getByText('1', { selector: 'span.badge' })).toBeInTheDocument();
  });
});

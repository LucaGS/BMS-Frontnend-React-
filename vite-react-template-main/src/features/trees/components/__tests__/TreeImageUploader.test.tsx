import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import TreeImageUploader from '../TreeImageUploader';

const fetchMock = vi.spyOn(global, 'fetch');

class FileReaderMock {
  result: string | ArrayBuffer | null = null;
  onload: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  readAsDataURL() {
    this.result = 'data:image/png;base64,ZmFrZQ==';
    this.onload?.({ target: { result: this.result } });
  }
}

describe('TreeImageUploader', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('FileReader', FileReaderMock as any);
  });

  it('shows a validation error for non-image files', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    render(<TreeImageUploader treeId={1} />);

    const fileInput = screen.getByLabelText(/neues bild hochladen/i) as HTMLInputElement;
    const badFile = new File(['data'], 'document.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      await screen.findByText(/bitte waehlen sie eine gueltige bilddatei/i)
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
    expect(await screen.findByRole('alert')).toHaveTextContent(/erfolgreich hochgeladen/i);
    expect(screen.getByText('1', { selector: 'span.badge' })).toBeInTheDocument();
  });
});

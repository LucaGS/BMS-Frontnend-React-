const germanDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const formatDateDisplay = (value?: string | Date | null, fallback = '-') => {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return typeof value === 'string' ? value : fallback;
  }

  return germanDateFormatter.format(parsed);
};
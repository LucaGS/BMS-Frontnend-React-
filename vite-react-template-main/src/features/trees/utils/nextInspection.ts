export type NextInspectionStatus = {
  label: string;
  shortLabel: string;
  relativeLabel: string | null;
  daysDifference: number | null;
  isOverdue: boolean;
  hasValue: boolean;
  parsedDate: Date | null;
};

export const getNextInspectionStatus = (value?: string | null): NextInspectionStatus => {
  if (!value) {
    return {
      label: 'Keine geplant',
      shortLabel: 'Keine geplant',
      relativeLabel: null,
      daysDifference: null,
      isOverdue: false,
      hasValue: false,
      parsedDate: null,
    };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return {
      label: value,
      shortLabel: value,
      relativeLabel: null,
      daysDifference: null,
      isOverdue: false,
      hasValue: true,
      parsedDate: null,
    };
  }

  const label = parsed.toLocaleString('de-DE');
  const now = Date.now();
  const diffMs = parsed.getTime() - now;
  const daysDifference = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffMs < 0;

  let relativeLabel: string | null = null;
  const absDays = Math.abs(daysDifference);
  if (absDays === 0) {
    relativeLabel = isOverdue ? 'Faellig seit heute' : 'Faellig heute';
  } else {
    relativeLabel = isOverdue
      ? `Faellig seit ${absDays} Tag${absDays === 1 ? '' : 'en'}`
      : `Faellig in ${absDays} Tag${absDays === 1 ? '' : 'en'}`;
  }

  return {
    label,
    shortLabel: parsed.toLocaleDateString('de-DE'),
    relativeLabel,
    daysDifference,
    isOverdue,
    hasValue: true,
    parsedDate: parsed,
  };
};

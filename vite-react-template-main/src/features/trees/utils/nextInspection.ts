import { formatDateDisplay } from '@/shared/lib/dateFormatting';

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

  const label = formatDateDisplay(parsed, value);
  const now = Date.now();
  const diffMs = parsed.getTime() - now;
  const daysDifference = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffMs < 0;

  let relativeLabel: string | null = null;
  const absDays = Math.abs(daysDifference);
  if (absDays === 0) {
    relativeLabel = isOverdue ? 'Fällig seit heute' : 'Fällig heute';
  } else {
    relativeLabel = isOverdue
      ? `Fällig seit ${absDays} Tag${absDays === 1 ? '' : 'en'}`
      : `Fällig in ${absDays} Tag${absDays === 1 ? '' : 'en'}`;
  }

  return {
    label,
    shortLabel: formatDateDisplay(parsed, value),
    relativeLabel,
    daysDifference,
    isOverdue,
    hasValue: true,
    parsedDate: parsed,
  };
};

export const getNextInspectionDaysLabel = (status: NextInspectionStatus) => {
  if (!status.hasValue) {
    return 'Keine geplant';
  }

  if (status.daysDifference === null) {
    return status.label;
  }

  if (status.daysDifference === 0) {
    return 'Heute fällig';
  }

  const absDays = Math.abs(status.daysDifference);
  return status.daysDifference < 0
    ? `Seit ${absDays} Tag${absDays === 1 ? '' : 'en'} fällig`
    : `In ${absDays} Tag${absDays === 1 ? '' : 'en'}`;
};

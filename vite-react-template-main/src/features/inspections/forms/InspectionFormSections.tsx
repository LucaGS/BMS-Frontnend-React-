import React from 'react';
import { OpenSectionsState, ToggleField } from './inspectionFormConfig';

const DESCRIPTION_MAX_LENGTH = 1000;

const checkboxInputStyle: React.CSSProperties = {
  width: '1.15rem',
  height: '1.15rem',
  cursor: 'pointer',
};

type ScoreSliderProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  colClassName?: string;
};

export function ScoreSlider({
  id,
  label,
  value,
  onChange,
  disabled,
  colClassName = 'col-md-4',
}: ScoreSliderProps) {
  return (
    <div className={colClassName}>
      <label htmlFor={id} className="form-label d-flex justify-content-between align-items-center">
        <span>{label}</span>
        <span className="badge bg-secondary">{value}/5</span>
      </label>
      <input
        type="range"
        className="form-range"
        min={0}
        max={5}
        step={1}
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
      />
    </div>
  );
}

type CheckboxGridProps<T extends { notes: string }> = {
  sectionId: string;
  items: ToggleField<T>[];
  state: T;
  onChange: (key: ToggleField<T>['key'], value: boolean) => void;
  onDescriptionChange: (key: ToggleField<T>['key'], value: string) => void;
  disabled: boolean;
};

function CheckboxGrid<T extends { notes: string }>({
  sectionId,
  items,
  state,
  onChange,
  onDescriptionChange,
  disabled,
}: CheckboxGridProps<T>) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {items.map(({ key, label }) => (
        <div className="col" key={`${sectionId}-${String(key)}`}>
          <div className="border rounded-3 p-2 h-100 bg-white">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`${sectionId}-${String(key)}`}
                checked={Boolean(state[key])}
                onChange={(event) => onChange(key, event.target.checked)}
                disabled={disabled}
                style={checkboxInputStyle}
              />
              <label className="form-check-label" htmlFor={`${sectionId}-${String(key)}`}>
                {label}
              </label>
            </div>
            {state[key] ? (
              <textarea
                className="form-control form-control-sm mt-2"
                placeholder="Beschreibung (optional)"
                value={(state as any)[`${String(key)}Description`] ?? ''}
                maxLength={DESCRIPTION_MAX_LENGTH}
                onChange={(event) => onDescriptionChange(key, event.target.value)}
                disabled={disabled}
                rows={2}
              />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

type InspectionSectionProps<T extends { notes: string }> = {
  sectionKey: keyof OpenSectionsState;
  title: string;
  badge: string;
  description: string;
  notesId: string;
  notesLabel: string;
  notesPlaceholder: string;
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  items: ToggleField<T>[];
  isOpen: boolean;
  onToggle: () => void;
  isSubmitting: boolean;
};

export function InspectionSection<T extends { notes: string }>({
  sectionKey,
  title,
  badge,
  description,
  notesId,
  notesLabel,
  notesPlaceholder,
  state,
  setState,
  items,
  isOpen,
  onToggle,
  isSubmitting,
}: InspectionSectionProps<T>) {
  return (
    <div className="col-12">
      <div className="border rounded-3 p-3 bg-light">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <p className="fw-semibold mb-1">{title}</p>
            <small className="text-muted">{description}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-bg-secondary text-uppercase">{badge}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-controls={`${sectionKey}-content`}
            >
              {isOpen ? 'Einklappen' : 'Ausklappen'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div id={`${sectionKey}-content`} className="mt-3">
            <div className="mb-3">
              <label htmlFor={notesId} className="form-label">
                {notesLabel}
              </label>
              <textarea
                className="form-control"
                id={notesId}
                rows={2}
                value={state.notes}
                onChange={(event) => setState((prev) => ({ ...prev, notes: event.target.value }))}
                disabled={isSubmitting}
                placeholder={notesPlaceholder}
              />
            </div>
            <CheckboxGrid
              sectionId={sectionKey}
              items={items}
              state={state}
              onChange={(key, value) =>
                setState((prev) => ({
                  ...prev,
                  [key]: value,
                  [`${String(key)}Description`]: value ? (prev as any)[`${String(key)}Description`] ?? '' : '',
                }))
              }
              onDescriptionChange={(key, value) =>
                setState((prev) => ({
                  ...prev,
                  [`${String(key)}Description`]: value,
                }))
              }
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** The event categories catalog-service accepts on create/list. */
export interface CategoryOption {
  value: string;
  label: string;
}

export const EVENT_CATEGORIES: CategoryOption[] = [
  { value: 'concert', label: 'Konser' },
  { value: 'festival', label: 'Festival' },
  { value: 'sports', label: 'Olahraga' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'theater', label: 'Teater' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Lainnya' },
];

export function categoryLabel(value: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

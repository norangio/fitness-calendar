/** Built-in categories. Custom string values are also allowed. */
export type PainCategory = 'back' | 'knee' | 'ankle' | (string & {});

export const PRESET_CATEGORIES: { value: PainCategory; label: string }[] = [
  { value: 'back', label: 'Back' },
  { value: 'knee', label: 'Knee' },
  { value: 'ankle', label: 'Ankle' },
];

export interface BodyLogEntry {
  id: string;
  date: string;          // YYYY-MM-DD
  category: PainCategory;
  severity: number;      // 1 (mild) to 5 (severe)
  notes?: string;
  createdAt: string;     // ISO timestamp
}

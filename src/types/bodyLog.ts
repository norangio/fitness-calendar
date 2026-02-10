export type PainCategory = 'back' | 'knee';

export interface BodyLogEntry {
  id: string;
  date: string;          // YYYY-MM-DD
  category: PainCategory;
  severity: number;      // 1 (mild) to 5 (severe)
  notes?: string;
  createdAt: string;     // ISO timestamp
}

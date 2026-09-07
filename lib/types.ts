import type { AdminOnlyFieldKey, FieldKey } from "@/lib/fields";

export type SubmissionData = Record<FieldKey, string> &
  Partial<Record<AdminOnlyFieldKey, string>>;

export type Submission = SubmissionData & {
  id: string;
  createdAt: string;
  excelUrl: string | null;
  excelFileName: string | null;
  privacyConsentAt?: string;
  marketingConsent?: boolean;
  /** ISO date when an admin opened the detail; null/undefined = da leggere */
  readAt?: string | null;
  /** ISO date when moved to trash; null/undefined = attiva */
  deletedAt?: string | null;
};

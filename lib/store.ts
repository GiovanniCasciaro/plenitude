import { mkdir, writeFile, readFile, readdir, rm } from "fs/promises";
import path from "path";
import { assertStorageAvailable, hasBlobStorage } from "@/lib/env";
import {
  deleteSubmissionBlobs,
  listSubmissionDataBlobs,
  readBlobText,
  submissionDataPath,
  submissionExcelPath,
  writeBlob,
} from "@/lib/blob-access";
import { buildExcelFileName, buildWorkbook } from "@/lib/excel";
import {
  applyMailboxStatus,
  loadMailboxState,
  removeMailboxEntry,
  saveMailboxState,
  updateMailboxEntry,
  type MailboxState,
} from "@/lib/mailbox";
import type { Submission, SubmissionData } from "@/lib/types";

const DATA_ROOT = path.join(process.cwd(), "data", "submissions");
const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function localDir(id: string) {
  return path.join(DATA_ROOT, id);
}

function localDataPath(id: string) {
  return path.join(localDir(id), "data.json");
}

function localExcelPath(id: string, fileName: string) {
  return path.join(localDir(id), fileName);
}

function adminExcelUrl(id: string) {
  return `/api/admin/export/file?id=${id}`;
}

function normalizeSubmission(submission: Submission): Submission {
  return {
    ...submission,
    readAt: submission.readAt ?? null,
    deletedAt: submission.deletedAt ?? null,
    excelUrl: adminExcelUrl(submission.id),
  };
}

async function persistSubmissionRecord(submission: Submission) {
  // Keep data.json free of mailbox status so CDN-cached payload cannot overwrite status.
  const { readAt: _readAt, deletedAt: _deletedAt, ...rest } = submission;
  const payload = JSON.stringify(rest);

  if (hasBlobStorage()) {
    await writeBlob(
      submissionDataPath(submission.id),
      payload,
      "application/json; charset=utf-8",
      { cacheControlMaxAge: 60 },
    );
    return;
  }

  await mkdir(localDir(submission.id), { recursive: true });
  await writeFile(
    localDataPath(submission.id),
    JSON.stringify(rest, null, 2),
  );
}

async function saveToBlob(submission: Submission, excelBuffer: Buffer) {
  const { id, excelFileName } = submission;
  if (!excelFileName) {
    throw new Error("Nome file Excel mancante.");
  }

  await writeBlob(
    submissionExcelPath(id, excelFileName),
    excelBuffer,
    XLSX_CONTENT_TYPE,
  );

  submission.excelUrl = adminExcelUrl(id);
  await persistSubmissionRecord(submission);
}

async function saveLocally(
  submission: Submission,
  excelBuffer: Buffer,
  fileName: string,
) {
  submission.excelUrl = adminExcelUrl(submission.id);
  await mkdir(localDir(submission.id), { recursive: true });
  await writeFile(localExcelPath(submission.id, fileName), excelBuffer);
  await persistSubmissionRecord(submission);
}

export async function createSubmission(
  input: SubmissionData,
  consents?: {
    privacyConsentAt?: string;
    marketingConsent?: boolean;
  },
): Promise<Submission> {
  assertStorageAvailable();

  const id = crypto.randomUUID();
  const submission: Submission = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
    excelUrl: null,
    excelFileName: null,
    privacyConsentAt: consents?.privacyConsentAt,
    marketingConsent: consents?.marketingConsent ?? false,
    readAt: null,
    deletedAt: null,
  };

  const fileName = buildExcelFileName(submission);
  submission.excelFileName = fileName;

  const excelBuffer = await buildWorkbook(submission);

  try {
    if (hasBlobStorage()) {
      await saveToBlob(submission, excelBuffer);
    } else {
      await saveLocally(submission, excelBuffer, fileName);
    }
    await updateMailboxEntry(id, { readAt: null, deletedAt: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore storage sconosciuto";
    console.error("Storage error:", error);
    throw new Error(
      hasBlobStorage()
        ? `Impossibile salvare la candidatura su Vercel Blob: ${message}`
        : `Impossibile salvare la candidatura in locale: ${message}`,
    );
  }

  return normalizeSubmission(submission);
}

async function migrateLegacyMailboxEntries(
  submissions: Submission[],
  mailbox: MailboxState,
): Promise<MailboxState> {
  let changed = false;
  const next: MailboxState = { ...mailbox };

  for (const submission of submissions) {
    if (next[submission.id]) {
      continue;
    }
    if (submission.readAt || submission.deletedAt) {
      next[submission.id] = {
        readAt: submission.readAt ?? null,
        deletedAt: submission.deletedAt ?? null,
      };
      changed = true;
    }
  }

  if (changed) {
    await saveMailboxState(next);
  }

  return next;
}

export async function listSubmissions(): Promise<Submission[]> {
  let submissions: Submission[] = [];
  let mailbox = await loadMailboxState();

  if (hasBlobStorage()) {
    const dataBlobs = await listSubmissionDataBlobs();
    const results = await Promise.all(
      dataBlobs.map(async (blob) => {
        try {
          const raw = await readBlobText(blob.pathname);
          return JSON.parse(raw) as Submission;
        } catch {
          return null;
        }
      }),
    );
    submissions = results.filter((item): item is Submission => item !== null);
  } else {
    try {
      const dirs = await readdir(DATA_ROOT, { withFileTypes: true });
      const results = await Promise.all(
        dirs
          .filter((entry) => entry.isDirectory())
          .map(async (entry) => {
            try {
              const raw = await readFile(localDataPath(entry.name), "utf-8");
              return JSON.parse(raw) as Submission;
            } catch {
              return null;
            }
          }),
      );
      submissions = results.filter((item): item is Submission => item !== null);
    } catch {
      submissions = [];
    }
  }

  mailbox = await migrateLegacyMailboxEntries(submissions, mailbox);

  return submissions
    .map((item) => normalizeSubmission(applyMailboxStatus(item, mailbox)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmission(id: string): Promise<Submission | null> {
  let submission: Submission | null = null;

  if (hasBlobStorage()) {
    try {
      const raw = await readBlobText(submissionDataPath(id));
      submission = JSON.parse(raw) as Submission;
    } catch {
      submission = null;
    }
  } else {
    try {
      const raw = await readFile(localDataPath(id), "utf-8");
      submission = JSON.parse(raw) as Submission;
    } catch {
      submission = null;
    }
  }

  if (!submission) {
    return null;
  }

  const mailbox = await loadMailboxState();
  return normalizeSubmission(applyMailboxStatus(submission, mailbox));
}

export async function markSubmissionRead(id: string): Promise<Submission | null> {
  const submission = await getSubmission(id);
  if (!submission || submission.deletedAt) {
    return submission;
  }

  if (submission.readAt) {
    return submission;
  }

  const entry = await updateMailboxEntry(id, {
    readAt: new Date().toISOString(),
  });
  return normalizeSubmission({
    ...submission,
    readAt: entry.readAt,
    deletedAt: entry.deletedAt,
  });
}

export async function softDeleteSubmission(
  id: string,
): Promise<Submission | null> {
  const submission = await getSubmission(id);
  if (!submission) {
    return null;
  }

  const entry = await updateMailboxEntry(id, {
    deletedAt: new Date().toISOString(),
    readAt: submission.readAt ?? null,
  });

  return normalizeSubmission({
    ...submission,
    readAt: entry.readAt,
    deletedAt: entry.deletedAt,
  });
}

export async function restoreSubmission(id: string): Promise<Submission | null> {
  const submission = await getSubmission(id);
  if (!submission) {
    return null;
  }

  const entry = await updateMailboxEntry(id, {
    deletedAt: null,
    readAt: submission.readAt ?? null,
  });

  return normalizeSubmission({
    ...submission,
    readAt: entry.readAt,
    deletedAt: entry.deletedAt,
  });
}

export async function permanentlyDeleteSubmission(id: string): Promise<boolean> {
  const submission = await getSubmission(id);
  if (!submission) {
    return false;
  }

  if (hasBlobStorage()) {
    await deleteSubmissionBlobs(id);
  } else {
    await rm(localDir(id), { recursive: true, force: true });
  }

  await removeMailboxEntry(id);
  return true;
}

export async function getSubmissionExcel(
  submission: Submission,
): Promise<{ buffer: Buffer; fileName: string }> {
  const fileName = submission.excelFileName ?? buildExcelFileName(submission);
  const buffer = await buildWorkbook(submission);
  return { buffer, fileName };
}

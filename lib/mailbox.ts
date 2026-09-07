import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";
import { hasBlobStorage } from "@/lib/env";
import { readBlobText, writeBlob } from "@/lib/blob-access";

export type MailboxEntry = {
  readAt: string | null;
  deletedAt: string | null;
};

export type MailboxState = Record<string, MailboxEntry>;

const MAILBOX_PREFIX = "mailbox/state-";
const LOCAL_MAILBOX_PATH = path.join(process.cwd(), "data", "mailbox.json");

function emptyEntry(): MailboxEntry {
  return { readAt: null, deletedAt: null };
}

async function loadLocalMailbox(): Promise<MailboxState> {
  try {
    const raw = await readFile(LOCAL_MAILBOX_PATH, "utf-8");
    return JSON.parse(raw) as MailboxState;
  } catch {
    return {};
  }
}

async function saveLocalMailbox(state: MailboxState) {
  await mkdir(path.dirname(LOCAL_MAILBOX_PATH), { recursive: true });
  await writeFile(LOCAL_MAILBOX_PATH, JSON.stringify(state, null, 2), "utf-8");
}

async function loadBlobMailbox(): Promise<MailboxState> {
  const { blobs } = await list({ prefix: MAILBOX_PREFIX });
  if (blobs.length === 0) {
    return {};
  }

  const latest = [...blobs].sort(
    (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
  )[0];

  try {
    const raw = await readBlobText(latest.pathname);
    return JSON.parse(raw) as MailboxState;
  } catch {
    return {};
  }
}

async function saveBlobMailbox(state: MailboxState) {
  // Unique pathname avoids Vercel Blob CDN serving a stale overwritten data.json.
  const pathname = `${MAILBOX_PREFIX}${Date.now()}.json`;
  await writeBlob(pathname, JSON.stringify(state), "application/json; charset=utf-8", {
    cacheControlMaxAge: 60,
  });

  // Best-effort cleanup of older snapshots (keep last 5).
  try {
    const { blobs } = await list({ prefix: MAILBOX_PREFIX });
    const sorted = [...blobs].sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
    );
    const stale = sorted.slice(5);
    if (stale.length > 0) {
      const { del } = await import("@vercel/blob");
      await del(stale.map((blob) => blob.url));
    }
  } catch (error) {
    console.warn("Mailbox cleanup skipped:", error);
  }
}

export async function loadMailboxState(): Promise<MailboxState> {
  if (hasBlobStorage()) {
    return loadBlobMailbox();
  }
  return loadLocalMailbox();
}

export async function saveMailboxState(state: MailboxState): Promise<void> {
  if (hasBlobStorage()) {
    await saveBlobMailbox(state);
    return;
  }
  await saveLocalMailbox(state);
}

export async function getMailboxEntry(id: string): Promise<MailboxEntry> {
  const state = await loadMailboxState();
  return state[id] ?? emptyEntry();
}

export async function updateMailboxEntry(
  id: string,
  patch: Partial<MailboxEntry>,
): Promise<MailboxEntry> {
  const state = await loadMailboxState();
  const current = state[id] ?? emptyEntry();
  const next: MailboxEntry = {
    readAt: patch.readAt !== undefined ? patch.readAt : current.readAt,
    deletedAt:
      patch.deletedAt !== undefined ? patch.deletedAt : current.deletedAt,
  };
  state[id] = next;
  await saveMailboxState(state);
  return next;
}

export async function removeMailboxEntry(id: string): Promise<void> {
  const state = await loadMailboxState();
  if (!(id in state)) {
    return;
  }
  delete state[id];
  await saveMailboxState(state);
}

export function applyMailboxStatus<T extends { id: string; readAt?: string | null; deletedAt?: string | null }>(
  submission: T,
  mailbox: MailboxState,
): T {
  const entry = mailbox[submission.id];
  if (!entry) {
    // Fall back to fields embedded in data.json (legacy), then null.
    return {
      ...submission,
      readAt: submission.readAt ?? null,
      deletedAt: submission.deletedAt ?? null,
    };
  }

  return {
    ...submission,
    readAt: entry.readAt,
    deletedAt: entry.deletedAt,
  };
}

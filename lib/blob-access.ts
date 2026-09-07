import { del, get, list, put } from "@vercel/blob";

export const BLOB_ACCESS = "private" as const;

export function submissionDataPath(id: string) {
  return `submissions/${id}/data.json`;
}

export function submissionExcelPath(id: string, fileName: string) {
  return `submissions/${id}/${fileName}`;
}

export function submissionPrefix(id: string) {
  return `submissions/${id}/`;
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  const response = new Response(stream);
  return Buffer.from(await response.arrayBuffer());
}

export async function readBlobText(pathname: string) {
  const result = await get(pathname, { access: BLOB_ACCESS });
  if (!result?.stream) {
    throw new Error(`Blob non trovato: ${pathname}`);
  }
  const buffer = await streamToBuffer(result.stream);
  return buffer.toString("utf-8");
}

export async function readBlobBuffer(pathname: string) {
  const result = await get(pathname, { access: BLOB_ACCESS });
  if (!result?.stream) {
    throw new Error(`Blob non trovato: ${pathname}`);
  }
  return streamToBuffer(result.stream);
}

export async function writeBlob(
  pathname: string,
  body: string | Buffer,
  contentType: string,
  options?: { cacheControlMaxAge?: number },
) {
  return put(pathname, body, {
    access: BLOB_ACCESS,
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
    // data.json is mutated often (read/trash); keep edge cache short
    cacheControlMaxAge: options?.cacheControlMaxAge ?? 60,
  });
}

export async function listSubmissionDataBlobs() {
  const { blobs } = await list({ prefix: "submissions/" });
  return blobs.filter((blob) => blob.pathname.endsWith("/data.json"));
}

export async function deleteSubmissionBlobs(id: string) {
  const { blobs } = await list({ prefix: submissionPrefix(id) });
  if (blobs.length === 0) {
    return;
  }
  await del(blobs.map((blob) => blob.url));
}

export function isVercelRuntime() {
  return process.env.VERCEL === "1";
}

export function getSessionSecret() {
  const secret =
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-session-secret-solo-in-locale"
      : undefined);

  if (!secret) {
    throw new Error("SESSION_SECRET non configurato.");
  }

  return new TextEncoder().encode(secret);
}

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function assertStorageAvailable() {
  if (isVercelRuntime() && !hasBlobStorage()) {
    throw new Error(
      "Storage non configurato: collega Vercel Blob al progetto e imposta BLOB_READ_WRITE_TOKEN.",
    );
  }
}

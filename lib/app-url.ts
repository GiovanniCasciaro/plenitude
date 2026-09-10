export const CANONICAL_APP_URL = "https://plenitudedealerita.it";

function stripTrailingSlash(value: string) {
  return value.trim().replace(/\/$/, "");
}

function isLocalUrl(value: string) {
  return /localhost|127\.0\.0\.1/i.test(value);
}

export function getPublicAppUrl(request?: Request) {
  const explicit = process.env.APP_URL
    ? stripTrailingSlash(process.env.APP_URL)
    : undefined;

  if (explicit && isLocalUrl(explicit)) {
    return explicit;
  }

  if (request && process.env.NODE_ENV === "development") {
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host")?.trim();
    if (host && isLocalUrl(host)) {
      return `http://${host}`;
    }
    try {
      const origin = new URL(request.url).origin;
      if (isLocalUrl(origin)) return origin;
    } catch {
      // ignore invalid request URL
    }
  }

  return CANONICAL_APP_URL;
}

export function getAdminSubmissionUrl(submissionId: string, request?: Request) {
  return `${getPublicAppUrl(request)}/admin/${submissionId}`;
}

export function getAdminUrl(request?: Request) {
  return `${getPublicAppUrl(request)}/admin`;
}

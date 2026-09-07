export function getPublicAppUrl(request?: Request) {
  const explicit = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }

  if (request) {
    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host")?.trim();

    if (host && !host.startsWith("localhost")) {
      const proto =
        request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
        "https";
      return `${proto}://${host}`;
    }

    return new URL(request.url).origin;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
    /^https?:\/\//,
    "",
  );
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export function getAdminSubmissionUrl(submissionId: string, request?: Request) {
  return `${getPublicAppUrl(request)}/admin/${submissionId}`;
}

export function getAdminUrl(request?: Request) {
  return `${getPublicAppUrl(request)}/admin`;
}

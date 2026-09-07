export const SUBMIT_SUCCESS_MESSAGE =
  "Richiesta inviata con successo. Dopo l'approvazione di Plenitude riceverai il contratto via email per la firma digitale.";

export function isBrowserFormSubmit(request: Request) {
  const fetchMode = request.headers.get("sec-fetch-mode");
  if (fetchMode === "navigate") return true;

  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html") && !accept.includes("application/json");
}

export function submitRedirectUrl(
  request: Request,
  params: Record<string, string>,
) {
  const url = new URL("/", request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.hash = "candidatura";
  return url;
}

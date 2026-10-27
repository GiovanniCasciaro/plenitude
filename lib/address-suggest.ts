import { ITALIAN_PROVINCES, ITALIAN_REGIONS } from "@/lib/italy-geo";

export type AddressSuggestion = {
  id: string;
  label: string;
  street: string;
  housenumber: string;
  postcode: string;
  city: string;
  provinceSigla: string;
  provinceName: string;
  region: string;
  /** Full Italian-style address: "Via Roma 10, 00100 Milano (MI)" */
  formatted: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  "ISO3166-2-lvl6"?: string;
};

type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  display_name?: string;
  address?: NominatimAddress;
};

const REGION_ALIASES: Record<string, string> = {
  "trentino-alto adige": "Trentino-Alto Adige/Südtirol",
  "trentino alto adige": "Trentino-Alto Adige/Südtirol",
  sudtirol: "Trentino-Alto Adige/Südtirol",
  "südtirol": "Trentino-Alto Adige/Südtirol",
  "valle d'aosta": "Valle d'Aosta/Vallée d'Aoste",
  "valle d aosta": "Valle d'Aosta/Vallée d'Aoste",
  "vallee d'aoste": "Valle d'Aosta/Vallée d'Aoste",
  "emilia romagna": "Emilia-Romagna",
  "friuli venezia giulia": "Friuli-Venezia Giulia",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchItalianRegion(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  const key = normalize(raw);
  const aliased = REGION_ALIASES[key];
  if (aliased) return aliased;

  const exact = ITALIAN_REGIONS.find((region) => normalize(region) === key);
  if (exact) return exact;

  const partial = ITALIAN_REGIONS.find(
    (region) =>
      normalize(region).includes(key) || key.includes(normalize(region)),
  );
  return partial ?? "";
}

export function matchItalianProvince(
  raw: string | undefined,
  region?: string,
): { sigla: string; nome: string; regione: string } | null {
  if (!raw?.trim()) return null;
  const key = normalize(raw);
  const pool = region
    ? ITALIAN_PROVINCES.filter((item) => item.regione === region)
    : ITALIAN_PROVINCES;

  const bySigla = pool.find((item) => item.sigla.toLowerCase() === key);
  if (bySigla) return bySigla;

  const byName = pool.find((item) => normalize(item.nome) === key);
  if (byName) return byName;

  const partial = pool.find(
    (item) =>
      normalize(item.nome).includes(key) || key.includes(normalize(item.nome)),
  );
  return partial ?? null;
}

function cityFromAddress(address: NominatimAddress) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    ""
  );
}

function streetFromAddress(address: NominatimAddress) {
  return address.road || address.pedestrian || "";
}

function provinceSiglaFromIso(iso: string | undefined) {
  if (!iso) return "";
  const match = iso.toUpperCase().match(/^IT-([A-Z]{2})$/);
  return match?.[1] ?? "";
}

function buildLabel(suggestion: Omit<AddressSuggestion, "id" | "label">) {
  const line = [suggestion.street, suggestion.housenumber]
    .filter(Boolean)
    .join(" ");
  const locality = [
    suggestion.postcode,
    suggestion.city,
    suggestion.provinceSigla ? `(${suggestion.provinceSigla})` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return [line, locality].filter(Boolean).join(", ");
}

function toSuggestion(result: NominatimResult): AddressSuggestion | null {
  const address = result.address;
  if (!address) return null;
  if (address.country_code && address.country_code.toLowerCase() !== "it") {
    return null;
  }

  const region = matchItalianRegion(address.state);
  const isoSigla = provinceSiglaFromIso(address["ISO3166-2-lvl6"]);
  const province =
    (isoSigla
      ? matchItalianProvince(isoSigla, region || undefined)
      : null) ||
    matchItalianProvince(address.county, region || undefined) ||
    matchItalianProvince(cityFromAddress(address), region || undefined);

  const street = streetFromAddress(address).trim();
  const housenumber = (address.house_number ?? "").trim();
  const postcode = (address.postcode ?? "").trim();
  const city = cityFromAddress(address).trim();

  if (!street && !city) return null;

  const base = {
    street: street || city,
    housenumber,
    postcode,
    city,
    provinceSigla: province?.sigla ?? isoSigla,
    provinceName: province?.nome ?? "",
    region: region || province?.regione || "",
    formatted: "",
  };
  base.formatted = buildLabel(base);

  const id = [
    result.osm_type ?? "n",
    result.osm_id ?? result.place_id ?? base.formatted,
  ].join(":");

  return {
    id,
    label: base.formatted,
    ...base,
  };
}

export async function searchItalianAddresses(
  query: string,
  options: { limit?: number; signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const limit = Math.min(Math.max(options.limit ?? 6, 1), 10);
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "it");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("accept-language", "it");

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "PlenitudeDealerForm/1.0 (address-autocomplete; contact via APP_URL)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Servizio indirizzi non disponibile.");
  }

  const data = (await response.json()) as NominatimResult[];
  const seen = new Set<string>();
  const suggestions: AddressSuggestion[] = [];

  for (const result of data) {
    const suggestion = toSuggestion(result);
    if (!suggestion) continue;
    if (seen.has(suggestion.label)) continue;
    seen.add(suggestion.label);
    suggestions.push(suggestion);
  }

  return suggestions;
}

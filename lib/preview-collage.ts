import { getPublicAppUrl } from "@/lib/app-url";

export const PREVIEW_SITE_URL = getPublicAppUrl();

export const PREVIEW_HEADLINE =
  "Energia, processi digitali e supporto dedicato per la tua agenzia o negozio";

export const PREVIEW_SUBLINE =
  "Catalogo Luce, Gas, Fibra e Tech, compensi competitivi e operatività immediata con il portale Plenitude Dealer.";

export const PREVIEW_TILES = [
  {
    label: "Catalogo",
    title: "Luce & Gas",
    detail: "offerte low cost sempre a portafoglio",
    accent: "#009e62",
  },
  {
    label: "Compensi",
    title: "Crescono con te",
    detail: "bonus sui contratti attivi nel tempo",
    accent: "#95b849",
  },
  {
    label: "Portale Plenitude",
    title: "2 minuti",
    detail: "inserimento pratica senza allegati",
    accent: "#007a4c",
  },
  {
    label: "Tech",
    title: "Fibra & bundle",
    detail: "domestico, business e pertinenze",
    accent: "#009e62",
  },
] as const;

export const ENOVA_GRADIENT =
  "linear-gradient(90deg, #009e62 0%, #95b849 45%, #ffcd00 100%)";

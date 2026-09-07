export const EXCEL_HEADERS = [
  "Indirizzo e-mail a cui inviare il contratto",
  "Nome e Cognome titolare / Amministratore",
  "Ragione sociale (come in visura camerale)",
  "Partita IVA",
  "Sede legale",
  "Indirizzo (sede operativa)",
  "Comune (sede operativa)",
  "Cap (sede operativa)",
  "Provincia (sede operativa)",
  "Regione (sede operativa)",
  "Tipologia attività",
  "Esperienza settore energetico",
  "Altri competitor presenti",
] as const;

/** Campi scritti nel file Excel generato. */
export const FIELD_KEYS = [
  "email",
  "nomeCognome",
  "ragioneSociale",
  "partitaIva",
  "sedeLegale",
  "indirizzoOperativo",
  "comune",
  "cap",
  "provincia",
  "regione",
  "tipologiaAttivita",
  "esperienzaEnergetico",
  "altriCompetitor",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

/** Campi salvati e mostrati in admin ma esclusi dall'Excel. */
export const ADMIN_ONLY_FIELD_KEYS = [
  "areaManagerNome",
  "areaManagerCognome",
  "telefono",
] as const;
export type AdminOnlyFieldKey = (typeof ADMIN_ONLY_FIELD_KEYS)[number];
export type FormFieldKey = FieldKey | AdminOnlyFieldKey;

export const EXCEL_COLUMN_COUNT = FIELD_KEYS.length;
export const EXCEL_RANGE = `A1:${String.fromCharCode(64 + EXCEL_COLUMN_COUNT)}2`;

export const FORM_FIELDS: Array<{
  key: FormFieldKey;
  label: string;
  section: "areaManager" | "legal" | "operativo";
  type?: "text" | "email" | "tel" | "textarea" | "yesno";
  placeholder?: string;
  /** Se false, il campo non finisce nell'Excel generato. */
  includeInExcel?: boolean;
}> = [
  {
    key: "areaManagerNome",
    label: "Nome",
    section: "areaManager",
    placeholder: "Mario",
    includeInExcel: false,
  },
  {
    key: "areaManagerCognome",
    label: "Cognome",
    section: "areaManager",
    placeholder: "Rossi",
    includeInExcel: false,
  },
  {
    key: "email",
    label: EXCEL_HEADERS[0],
    section: "legal",
    type: "email",
    placeholder: "nome@azienda.it",
  },
  {
    key: "telefono",
    label: "Numero di telefono",
    section: "legal",
    type: "tel",
    placeholder: "+39 333 1234567",
    includeInExcel: false,
  },
  {
    key: "nomeCognome",
    label: EXCEL_HEADERS[1],
    section: "legal",
    placeholder: "Mario Rossi",
  },
  {
    key: "ragioneSociale",
    label: EXCEL_HEADERS[2],
    section: "legal",
    placeholder: "Azienda S.r.l.",
  },
  {
    key: "partitaIva",
    label: EXCEL_HEADERS[3],
    section: "legal",
    placeholder: "12345678901",
  },
  {
    key: "sedeLegale",
    label: EXCEL_HEADERS[4],
    section: "legal",
    placeholder: "Via Roma 1, 00100 Roma (RM)",
  },
  {
    key: "indirizzoOperativo",
    label: EXCEL_HEADERS[5],
    section: "operativo",
    placeholder: "Via Milano 10",
  },
  {
    key: "comune",
    label: EXCEL_HEADERS[6],
    section: "operativo",
    placeholder: "Milano",
  },
  {
    key: "cap",
    label: EXCEL_HEADERS[7],
    section: "operativo",
    placeholder: "20100",
  },
  {
    key: "provincia",
    label: EXCEL_HEADERS[8],
    section: "operativo",
    placeholder: "MI",
  },
  {
    key: "regione",
    label: EXCEL_HEADERS[9],
    section: "operativo",
    placeholder: "Lombardia",
  },
  {
    key: "tipologiaAttivita",
    label: EXCEL_HEADERS[10],
    section: "operativo",
    placeholder: "Agenzia immobiliare, negozio energia, ecc.",
  },
  {
    key: "esperienzaEnergetico",
    label: EXCEL_HEADERS[11],
    section: "operativo",
    type: "yesno",
  },
  {
    key: "altriCompetitor",
    label: EXCEL_HEADERS[12],
    section: "operativo",
    type: "textarea",
    placeholder: "Elenca altri competitor presenti",
  },
];

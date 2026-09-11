export const EXCEL_HEADERS = [
  "Rag. Sociale",
  "Partita IVA",
  "Nome",
  "Cognome",
  "Indirizzo",
  "Numero civico",
  "CAP",
  "Comune",
  "Provincia",
  "Regione",
] as const;

/** Campi scritti nel file Excel generato. */
export const FIELD_KEYS = [
  "ragioneSociale",
  "partitaIva",
  "nome",
  "cognome",
  "indirizzoOperativo",
  "numeroCivico",
  "cap",
  "comune",
  "provincia",
  "regione",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

/** Campi salvati e mostrati in admin ma esclusi dall'Excel. */
export const ADMIN_ONLY_FIELD_KEYS = [
  "areaManagerNome",
  "areaManagerCognome",
  "email",
  "telefono",
  "codiceFiscale",
  "indirizzoResidenza",
  "dataNascita",
  "luogoNascita",
  "sedeLegale",
  "tipologiaAttivita",
  "esperienzaEnergetico",
  "altriCompetitor",
  "noteAggiuntive",
  "nomeCognome",
] as const;
export type AdminOnlyFieldKey = (typeof ADMIN_ONLY_FIELD_KEYS)[number];
export type FormFieldKey = FieldKey | AdminOnlyFieldKey;

export const EXCEL_COLUMN_COUNT = FIELD_KEYS.length;
export const EXCEL_LEGAL_COLUMN_COUNT = 4;
export const EXCEL_RANGE = `A1:${String.fromCharCode(64 + EXCEL_COLUMN_COUNT)}2`;

export function titolareDisplayName(data: {
  nome?: string;
  cognome?: string;
  nomeCognome?: string;
}) {
  const combined = [data.nome, data.cognome]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  return combined || data.nomeCognome?.trim() || "";
}

export const FORM_FIELDS: Array<{
  key: FormFieldKey;
  label: string;
  section: "areaManager" | "legal" | "operativo" | "notes";
  type?: "text" | "email" | "tel" | "textarea" | "yesno";
  placeholder?: string;
  required?: boolean;
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
    label: "Indirizzo e-mail a cui inviare il contratto",
    section: "legal",
    type: "email",
    placeholder: "nome@azienda.it",
    includeInExcel: false,
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
    key: "nome",
    label: "Nome titolare / Amministratore",
    section: "legal",
    placeholder: "Mario",
  },
  {
    key: "cognome",
    label: "Cognome titolare / Amministratore",
    section: "legal",
    placeholder: "Rossi",
  },
  {
    key: "codiceFiscale",
    label: "Codice fiscale titolare / Amministratore",
    section: "legal",
    placeholder: "RSSMRA80A01H501U",
    includeInExcel: false,
  },
  {
    key: "indirizzoResidenza",
    label: "Indirizzo di residenza titolare / Amministratore",
    section: "legal",
    placeholder: "Via Roma 10, 00100 Roma (RM)",
    includeInExcel: false,
  },
  {
    key: "dataNascita",
    label: "Data di nascita titolare / Amministratore",
    section: "legal",
    placeholder: "GG/MM/AAAA",
    includeInExcel: false,
  },
  {
    key: "luogoNascita",
    label: "Luogo di nascita titolare / Amministratore",
    section: "legal",
    placeholder: "Roma",
    includeInExcel: false,
  },
  {
    key: "ragioneSociale",
    label: "Ragione sociale (come in visura camerale)",
    section: "legal",
    placeholder: "Azienda S.r.l.",
  },
  {
    key: "partitaIva",
    label: "Partita IVA",
    section: "legal",
    placeholder: "12345678901",
  },
  {
    key: "sedeLegale",
    label: "Sede legale",
    section: "legal",
    placeholder: "Via Roma 1, 00100 Roma (RM)",
    includeInExcel: false,
  },
  {
    key: "indirizzoOperativo",
    label: "Indirizzo (sede operativa)",
    section: "operativo",
    placeholder: "Via Milano",
  },
  {
    key: "numeroCivico",
    label: "Numero civico",
    section: "operativo",
    placeholder: "10",
  },
  {
    key: "comune",
    label: "Comune (sede operativa)",
    section: "operativo",
    placeholder: "Milano",
  },
  {
    key: "cap",
    label: "Cap (sede operativa)",
    section: "operativo",
    placeholder: "20100",
  },
  {
    key: "provincia",
    label: "Provincia (sede operativa)",
    section: "operativo",
    placeholder: "MI",
  },
  {
    key: "regione",
    label: "Regione (sede operativa)",
    section: "operativo",
    placeholder: "Lombardia",
  },
  {
    key: "tipologiaAttivita",
    label: "Tipologia attività",
    section: "operativo",
    placeholder: "Agenzia immobiliare, negozio energia, ecc.",
    includeInExcel: false,
  },
  {
    key: "esperienzaEnergetico",
    label: "Esperienza settore energetico",
    section: "operativo",
    type: "yesno",
    includeInExcel: false,
  },
  {
    key: "altriCompetitor",
    label: "Altri competitor presenti",
    section: "operativo",
    type: "textarea",
    placeholder: "Elenca altri competitor presenti",
    includeInExcel: false,
  },
  {
    key: "noteAggiuntive",
    label: "Note aggiuntive",
    section: "notes",
    type: "textarea",
    placeholder: "Eventuali informazioni utili (facoltativo)",
    required: false,
    includeInExcel: false,
  },
];

import { z } from "zod";

export const submissionSchema = z.object({
  areaManagerNome: z.string().min(2, "Inserisci il nome dell'Area Manager."),
  areaManagerCognome: z
    .string()
    .min(2, "Inserisci il cognome dell'Area Manager."),
  email: z.string().email("Inserisci un indirizzo email valido."),
  telefono: z
    .string()
    .trim()
    .min(8, "Inserisci un numero di telefono valido.")
    .max(20, "Il numero di telefono è troppo lungo.")
    .regex(
      /^[+0-9][\d\s().-]{6,18}\d$/,
      "Inserisci un numero di telefono valido.",
    ),
  nome: z.string().min(2, "Inserisci il nome del titolare / amministratore."),
  cognome: z
    .string()
    .min(2, "Inserisci il cognome del titolare / amministratore."),
  ragioneSociale: z.string().min(2, "Inserisci la ragione sociale."),
  partitaIva: z
    .string()
    .regex(/^\d{11}$/, "La Partita IVA deve contenere 11 cifre."),
  sedeLegale: z.string().min(5, "Inserisci la sede legale."),
  indirizzoOperativo: z.string().min(3, "Inserisci l'indirizzo operativo."),
  numeroCivico: z
    .string()
    .trim()
    .min(1, "Inserisci il numero civico.")
    .max(15, "Il numero civico è troppo lungo."),
  comune: z.string().min(2, "Inserisci il comune."),
  cap: z.string().regex(/^\d{5}$/, "Il CAP deve contenere 5 cifre."),
  provincia: z
    .string()
    .regex(/^[A-Za-z]{2}$/, "La provincia deve essere di 2 lettere.")
    .transform((value) => value.toUpperCase()),
  regione: z.string().min(2, "Inserisci la regione."),
  tipologiaAttivita: z.string().min(2, "Inserisci la tipologia di attività."),
  esperienzaEnergetico: z.enum(["Sì", "No"], {
    message: "Seleziona Sì o No per l'esperienza nel settore energetico.",
  }),
  altriCompetitor: z.string().min(2, "Indica gli altri competitor presenti."),
  noteAggiuntive: z
    .string()
    .trim()
    .max(2000, "Le note aggiuntive non possono superare i 2000 caratteri.")
    .default(""),
  website: z.string().max(0, "Richiesta non valida."),
  privacyConsent: z.literal(true, {
    message: "Per inviare la candidatura devi accettare la Privacy Policy.",
  }),
  marketingConsent: z.boolean().default(false),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

# Plenitude Leader — Prossime cose da fare

Checklist operativa per allineare questo progetto a quanto già fatto su **Iren Corner** (`~/Desktop/irencorner`).

> **Come Iren Corner:** non serve un database SQL. In produzione le candidature vanno su **Vercel Blob** (JSON + Excel + mailbox). In locale, senza Blob, i dati finiscono in `./data`.

---

## Stato attuale

### Già fatto (logica allineata a Iren Corner)

- [x] Form candidatura + validazione Zod + honeypot + rate limit
- [x] Campi Area Manager + telefono (esclusi dall’Excel, visibili in admin/email)
- [x] Generazione Excel per candidatura
- [x] Storage locale (`./data`) e Blob-ready (`lib/store.ts` + `lib/mailbox.ts`)
- [x] Autocomplete comuni (`lib/data/comuni.json`)
- [x] Notifica email Resend (`lib/notify.ts`) — attiva solo con `RESEND_API_KEY`
- [x] Admin: login username+password, rate-limit, middleware su `/admin` e `/api/admin`
- [x] Admin: tab da leggere / lette / cestino, ricerca e filtri
- [x] Anteprima email (`/anteprima`)
- [x] Privacy / Cookie policy
- [x] Branding Plenitude Leader + logo
- [x] `.env.local` locale per accedere all’admin

### Gap codice rispetto a Iren Corner (piccolo)

- [ ] Campo facoltativo **Note aggiuntive** (`noteAggiuntive`) — presente su Iren Corner, non ancora portato qui  
  File da allineare: `lib/fields.ts`, `lib/validation.ts`, `components/PartnerForm.tsx`, `app/api/submit/route.ts`, dettaglio admin

### Gap infrastruttura (come su Iren Corner online)

- [ ] Repository GitHub dedicato (Iren Corner: `github.com/GiovanniCasciaro/irencorner` — questo progetto non ha ancora remote)
- [ ] Progetto Vercel collegato al repo
- [ ] **Vercel Blob nuovo** (non riusare quello di Iren Corner)
- [ ] Variabili ambiente produzione (vedi sotto)
- [ ] Dominio custom + `APP_URL`
- [ ] Resend: API key + dominio mittente verificato + `NOTIFIER_EMAIL`
- [ ] Test end-to-end in produzione

---

## 1. Allineare l’ultimo pezzo di codice (opzionale ma consigliato)

Portare da Iren Corner il campo **Note aggiuntive** (textarea facoltativa, non in Excel).

Poi commit locale e push sul nuovo repo.

---

## 2. Creare repo e deploy (come Iren Corner)

1. Inizializza git (se non già fatto) e crea un repo GitHub, es. `plenitude-leader`.
2. Push del codice (senza `.env.local` — è già in `.gitignore`).
3. Su [vercel.com](https://vercel.com): **Add New Project** → importa il repo.
4. Framework: Next.js (rilevato automaticamente). Build: `next build`.

Riferimento Iren Corner: stesso flusso descritto in `irencorner/README.md` → sezione **Deploy su Vercel**.

---

## 3. Storage = Vercel Blob (il “DB” di Iren Corner)

1. Nel progetto Vercel: **Storage → Blob → Create**.
2. Collega lo store al progetto Plenitude Leader.
3. Vercel aggiunge automaticamente:
   - `BLOB_READ_WRITE_TOKEN`
   - (eventualmente) `BLOB_STORE_ID`

**Importante:** crea uno store **nuovo**. Non riusare il Blob di Iren Corner, altrimenti mescoli le candidature.

Struttura salvata (identica a Iren Corner):

```
submissions/{id}/data.json
submissions/{id}/candidatura-*.xlsx
mailbox/state-*.json
```

---

## 4. Variabili ambiente da impostare su Vercel

Copia i valori in **Project → Settings → Environment Variables** (Production + Preview se serve).

| Variabile | Obbligatoria | Note |
|-----------|--------------|------|
| `BLOB_READ_WRITE_TOKEN` | Sì (prod) | Di solito auto da Storage → Blob |
| `ADMIN_USERNAME` | Sì | Es. `enova26italia` |
| `ADMIN_PASSWORD` | Sì | Password forte (diversa da quella di sviluppo) |
| `SESSION_SECRET` | Sì | Stringa casuale ≥ 32 caratteri |
| `RESEND_API_KEY` | Sì (per email) | Da [resend.com](https://resend.com) |
| `RESEND_FROM` | Sì (per email) | Es. `Plenitude Leader <noreply@tuodominio.it>` — dominio verificato su Resend |
| `NOTIFIER_EMAIL` | Sì (per email) | Destinatario avviso nuova candidatura |
| `APP_URL` | Sì | URL pubblico, es. `https://tuodominio.it` (link nell’email admin) |
| `LEGAL_ENTITY_NAME` | Consigliata | Titolare trattamento |
| `LEGAL_ENTITY_ADDRESS` | Consigliata | Indirizzo completo |
| `LEGAL_ENTITY_VAT` | Consigliata | P. IVA |
| `LEGAL_PRIVACY_EMAIL` | Consigliata | Contatto privacy |

Template: vedi `.env.example` in questo progetto.

---

## 5. Email avviso nuova candidatura (Resend)

Come su Iren Corner:

1. Account Resend + API key.
2. Verifica il dominio mittente (o, in test, usa solo l’indirizzo sandbox Resend).
3. Imposta su Vercel:
   - `RESEND_API_KEY`
   - `RESEND_FROM="Plenitude Leader <noreply@tuodominio.it>"`
   - `NOTIFIER_EMAIL="..."` (dove vuoi ricevere gli avvisi)
   - `APP_URL="https://tuodominio.it"`
4. Redeploy dopo aver salvato le variabili.

Senza `RESEND_API_KEY` il form salva comunque la candidatura, ma **non** manda l’email (solo warning in log).

---

## 6. Dominio

1. Su Vercel: **Domains** → aggiungi il dominio scelto.
2. Aggiorna DNS come indicato da Vercel.
3. Imposta `APP_URL` con l’URL finale `https://...` e rifai deploy.

---

## 7. Test di accettazione (stesso checklist di Iren Corner)

Dopo il deploy:

1. Apri il sito pubblico e compila il form (dati di prova).
2. Controlla che arrivi l’email su `NOTIFIER_EMAIL` con link admin.
3. Accedi a `/admin/login` con username/password di produzione.
4. Verifica candidatura in **Da leggere**, apri dettaglio, scarica Excel.
5. Segna come letta / sposta in cestino / ripristina.
6. Controlla Privacy e Cookie policy con i dati legali corretti.

---

## Ordine consigliato (rapido)

1. Portare `noteAggiuntive` (opzionale).
2. Repo GitHub + push.
3. Progetto Vercel.
4. Blob nuovo.
5. Env admin + legale.
6. Resend (key + from + notifier + `APP_URL`).
7. Dominio.
8. Test form → email → admin → Excel.

---

## Credenziali locali (solo sviluppo)

File: `.env.local` (non committare).

Admin locale attuale: vedi valori in `.env.local`.  
In produzione usa password e `SESSION_SECRET` **diversi**.

---

## Riferimento Iren Corner

| Cosa | Iren Corner | Plenitude Leader |
|------|-------------|------------------|
| Cartella | `~/Desktop/irencorner` | `~/Desktop/enova` |
| Repo | `GiovanniCasciaro/irencorner` | da creare |
| Storage prod | Vercel Blob | Vercel Blob (nuovo) |
| Email | Resend | Resend |
| Admin | `/admin` | `/admin` |
| Guida deploy | `irencorner/README.md` | questo file |

Quando hai creato il repo e il progetto Vercel, puoi spuntare i checkbox qui sopra man mano.

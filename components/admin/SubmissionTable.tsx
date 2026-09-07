"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSubmissionExcelDownloadUrl } from "@/lib/submission";

type AdminSection = "unread" | "read" | "trash";

export type SubmissionRow = {
  id: string;
  createdAt: string;
  email: string;
  telefono: string;
  areaManagerNome: string;
  areaManagerCognome: string;
  nomeCognome: string;
  ragioneSociale: string;
  partitaIva: string;
  provincia: string;
  comune: string;
  regione: string;
  tipologiaAttivita: string;
  esperienzaEnergetico: string;
  excelUrl: string | null;
  readAt: string | null;
  deletedAt: string | null;
};

type ActionResult = {
  submission?: SubmissionRow & Record<string, unknown>;
  ok?: boolean;
  error?: string;
};

async function runAction(
  id: string,
  action: "trash" | "restore" | "purge",
): Promise<ActionResult> {
  const response = await fetch(`/api/admin/submissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const data = (await response.json().catch(() => null)) as ActionResult | null;
  if (!response.ok) {
    throw new Error(data?.error ?? "Operazione non riuscita.");
  }
  return data ?? {};
}

function isUnread(row: SubmissionRow) {
  return !row.deletedAt && !row.readAt;
}

function isRead(row: SubmissionRow) {
  return !row.deletedAt && Boolean(row.readAt);
}

function isTrash(row: SubmissionRow) {
  return Boolean(row.deletedAt);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "it"),
  );
}

function toRow(submission: SubmissionRow & Record<string, unknown>): SubmissionRow {
  return {
    id: String(submission.id),
    createdAt: String(submission.createdAt),
    email: String(submission.email ?? ""),
    telefono: String(submission.telefono ?? ""),
    areaManagerNome: String(submission.areaManagerNome ?? ""),
    areaManagerCognome: String(submission.areaManagerCognome ?? ""),
    nomeCognome: String(submission.nomeCognome ?? ""),
    ragioneSociale: String(submission.ragioneSociale ?? ""),
    partitaIva: String(submission.partitaIva ?? ""),
    provincia: String(submission.provincia ?? ""),
    comune: String(submission.comune ?? ""),
    regione: String(submission.regione ?? ""),
    tipologiaAttivita: String(submission.tipologiaAttivita ?? ""),
    esperienzaEnergetico: String(submission.esperienzaEnergetico ?? ""),
    excelUrl:
      typeof submission.excelUrl === "string" ? submission.excelUrl : null,
    readAt: typeof submission.readAt === "string" ? submission.readAt : null,
    deletedAt:
      typeof submission.deletedAt === "string" ? submission.deletedAt : null,
  };
}

function matchesSearch(row: SubmissionRow, query: string) {
  if (!query) return true;
  const haystack = normalizeText(
    [
      row.areaManagerNome,
      row.areaManagerCognome,
      `${row.areaManagerNome} ${row.areaManagerCognome}`,
      row.nomeCognome,
      row.ragioneSociale,
      row.email,
      row.telefono,
      row.partitaIva,
      row.comune,
      row.provincia,
      row.regione,
      row.tipologiaAttivita,
    ].join(" "),
  );
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(normalizeText(token)));
}

export function SubmissionTable({
  submissions,
  initialSection = "unread",
}: {
  submissions: SubmissionRow[];
  initialSection?: AdminSection;
}) {
  const router = useRouter();
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [rows, setRows] = useState<SubmissionRow[]>(submissions);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterProvincia, setFilterProvincia] = useState("");
  const [filterComune, setFilterComune] = useState("");
  const [filterRegione, setFilterRegione] = useState("");
  const [filterTipologia, setFilterTipologia] = useState("");
  const [filterEsperienza, setFilterEsperienza] = useState("");

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setRows(submissions);
  }, [submissions]);

  const counts = useMemo(
    () => ({
      unread: rows.filter(isUnread).length,
      read: rows.filter(isRead).length,
      trash: rows.filter(isTrash).length,
    }),
    [rows],
  );

  const sectionRows = useMemo(() => {
    if (section === "unread") return rows.filter(isUnread);
    if (section === "read") return rows.filter(isRead);
    return rows.filter(isTrash);
  }, [section, rows]);

  const filterOptions = useMemo(() => {
    return {
      province: uniqueSorted(sectionRows.map((row) => row.provincia)),
      comuni: uniqueSorted(sectionRows.map((row) => row.comune)),
      regioni: uniqueSorted(sectionRows.map((row) => row.regione)),
      tipologie: uniqueSorted(sectionRows.map((row) => row.tipologiaAttivita)),
      esperienze: uniqueSorted(
        sectionRows.map((row) => row.esperienzaEnergetico),
      ),
    };
  }, [sectionRows]);

  const visible = useMemo(() => {
    const query = normalizeText(search);
    return sectionRows.filter((row) => {
      if (!matchesSearch(row, query)) return false;
      if (filterProvincia && row.provincia !== filterProvincia) return false;
      if (filterComune && row.comune !== filterComune) return false;
      if (filterRegione && row.regione !== filterRegione) return false;
      if (filterTipologia && row.tipologiaAttivita !== filterTipologia) {
        return false;
      }
      if (filterEsperienza && row.esperienzaEnergetico !== filterEsperienza) {
        return false;
      }
      return true;
    });
  }, [
    sectionRows,
    search,
    filterProvincia,
    filterComune,
    filterRegione,
    filterTipologia,
    filterEsperienza,
  ]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(filterProvincia) ||
    Boolean(filterComune) ||
    Boolean(filterRegione) ||
    Boolean(filterTipologia) ||
    Boolean(filterEsperienza);

  function clearFilters() {
    setSearch("");
    setFilterProvincia("");
    setFilterComune("");
    setFilterRegione("");
    setFilterTipologia("");
    setFilterEsperienza("");
  }

  function goToSection(next: AdminSection) {
    setSection(next);
    router.replace(`/admin?tab=${next}`, { scroll: false });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleAction(
    id: string,
    action: "trash" | "restore" | "purge",
    confirmMessage?: string,
  ) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setBusyId(id);
    setError("");
    try {
      const result = await runAction(id, action);

      if (action === "purge") {
        setRows((current) => current.filter((row) => row.id !== id));
        goToSection("trash");
      } else if (result.submission) {
        const updated = toRow(result.submission);
        setRows((current) =>
          current.map((row) => (row.id === id ? { ...row, ...updated } : row)),
        );

        if (action === "trash") {
          goToSection("trash");
        } else if (action === "restore") {
          goToSection(updated.readAt ? "read" : "unread");
        }
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operazione non riuscita.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-header">
        <div>
          <h1>Candidature partner</h1>
          <p className="hero-subtitle">
            {counts.unread} da leggere · {counts.read} lette · {counts.trash} nel
            cestino
          </p>
        </div>
        <button
          className="btn btn-ghost btn-small"
          type="button"
          onClick={handleLogout}
        >
          Esci
        </button>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Sezioni candidature">
        <button
          type="button"
          role="tab"
          aria-selected={section === "unread"}
          className={`admin-tab ${section === "unread" ? "is-active" : ""}`}
          onClick={() => goToSection("unread")}
        >
          Da leggere
          <span className="admin-tab__count">{counts.unread}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "read"}
          className={`admin-tab ${section === "read" ? "is-active" : ""}`}
          onClick={() => goToSection("read")}
        >
          Lette
          <span className="admin-tab__count">{counts.read}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "trash"}
          className={`admin-tab ${section === "trash" ? "is-active" : ""}`}
          onClick={() => goToSection("trash")}
        >
          Cestino
          <span className="admin-tab__count">{counts.trash}</span>
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <label htmlFor="admin-search">Cerca</label>
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, cognome, Area Manager, ragione sociale, email, telefono..."
          />
        </div>

        <div className="admin-filters">
          <div className="admin-filter">
            <label htmlFor="filter-regione">Regione</label>
            <select
              id="filter-regione"
              value={filterRegione}
              onChange={(event) => setFilterRegione(event.target.value)}
            >
              <option value="">Tutte</option>
              {filterOptions.regioni.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter">
            <label htmlFor="filter-provincia">Provincia</label>
            <select
              id="filter-provincia"
              value={filterProvincia}
              onChange={(event) => setFilterProvincia(event.target.value)}
            >
              <option value="">Tutte</option>
              {filterOptions.province.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter">
            <label htmlFor="filter-comune">Comune</label>
            <select
              id="filter-comune"
              value={filterComune}
              onChange={(event) => setFilterComune(event.target.value)}
            >
              <option value="">Tutti</option>
              {filterOptions.comuni.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter">
            <label htmlFor="filter-tipologia">Tipologia</label>
            <select
              id="filter-tipologia"
              value={filterTipologia}
              onChange={(event) => setFilterTipologia(event.target.value)}
            >
              <option value="">Tutte</option>
              {filterOptions.tipologie.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-filter">
            <label htmlFor="filter-esperienza">Esperienza</label>
            <select
              id="filter-esperienza"
              value={filterEsperienza}
              onChange={(event) => setFilterEsperienza(event.target.value)}
            >
              <option value="">Tutte</option>
              {filterOptions.esperienze.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-toolbar-meta">
          <p>
            {visible.length} risultat{visible.length === 1 ? "o" : "i"}
            {hasActiveFilters ? " (filtrati)" : ""}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={clearFilters}
            >
              Azzera filtri
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="form-status error">{error}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Area Manager</th>
              <th>Titolare</th>
              <th>Ragione sociale</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>P.IVA</th>
              <th>Comune</th>
              <th>Prov.</th>
              <th>Regione</th>
              <th></th>
              <th>Excel</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={13}>
                  {hasActiveFilters
                    ? "Nessuna candidatura corrisponde a ricerca/filtri."
                    : section === "unread"
                      ? "Nessuna candidatura da leggere."
                      : section === "read"
                        ? "Nessuna candidatura letta."
                        : "Il cestino è vuoto."}
                </td>
              </tr>
            ) : (
              visible.map((submission) => {
                const areaManager = [submission.areaManagerNome, submission.areaManagerCognome]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr
                    key={submission.id}
                    className={
                      isUnread(submission) ? "admin-row--unread" : undefined
                    }
                  >
                    <td>
                      {new Date(submission.createdAt).toLocaleDateString(
                        "it-IT",
                      )}
                    </td>
                    <td>{areaManager || "—"}</td>
                    <td>{submission.nomeCognome || "—"}</td>
                    <td>
                      {isUnread(submission) ? (
                        <strong>{submission.ragioneSociale}</strong>
                      ) : (
                        submission.ragioneSociale
                      )}
                    </td>
                    <td>{submission.email}</td>
                    <td>{submission.telefono || "—"}</td>
                    <td>{submission.partitaIva}</td>
                    <td>{submission.comune}</td>
                    <td>{submission.provincia}</td>
                    <td>{submission.regione || "—"}</td>
                    <td>
                      <Link
                        className="btn btn-ghost btn-small"
                        href={`/admin/${submission.id}`}
                        prefetch={false}
                      >
                        Dettaglio
                      </Link>
                    </td>
                    <td>
                      <a
                        className="btn btn-primary btn-small"
                        href={getSubmissionExcelDownloadUrl(submission)}
                      >
                        Scarica
                      </a>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {section === "trash" ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-ghost btn-small"
                              disabled={busyId === submission.id}
                              onClick={() =>
                                handleAction(submission.id, "restore")
                              }
                            >
                              Ripristina
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-small admin-btn-danger"
                              disabled={busyId === submission.id}
                              onClick={() =>
                                handleAction(
                                  submission.id,
                                  "purge",
                                  "Eliminare definitivamente questa candidatura? L'operazione non è reversibile.",
                                )
                              }
                            >
                              Elimina definitivo
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-small admin-btn-danger"
                            disabled={busyId === submission.id}
                            onClick={() =>
                              handleAction(
                                submission.id,
                                "trash",
                                "Spostare questa candidatura nel cestino?",
                              )
                            }
                          >
                            Elimina
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

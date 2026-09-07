import { readFile } from "fs/promises";
import path from "path";

export type ComuneRecord = {
  nome: string;
  sigla: string;
  cap: string[];
  regione: { nome: string };
  provincia: { nome: string };
};

let comuniCache: ComuneRecord[] | null = null;

async function loadComuni() {
  if (!comuniCache) {
    const filePath = path.join(process.cwd(), "lib", "data", "comuni.json");
    const raw = await readFile(filePath, "utf-8");
    comuniCache = JSON.parse(raw) as ComuneRecord[];
  }
  return comuniCache;
}

export async function searchComuni(sigla: string, query = "") {
  const comuni = await loadComuni();
  const provinceCode = sigla.toUpperCase();
  const normalizedQuery = query.trim().toLowerCase();

  return comuni
    .filter((comune) => comune.sigla === provinceCode)
    .filter((comune) =>
      normalizedQuery
        ? comune.nome.toLowerCase().includes(normalizedQuery)
        : true,
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, "it"))
    .map((comune) => ({
      nome: comune.nome,
      cap: comune.cap,
    }));
}

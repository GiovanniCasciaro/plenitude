"use client";

import { useEffect, useMemo, useState } from "react";
import { ITALIAN_REGIONS, provincesForRegion } from "@/lib/italy-geo";

type ComuneOption = {
  nome: string;
  cap: string[];
};

export function LocationFields({ resetKey = 0 }: { resetKey?: number }) {
  const [regione, setRegione] = useState("");
  const [provincia, setProvincia] = useState("");
  const [comune, setComune] = useState("");
  const [cap, setCap] = useState("");
  const [capOptions, setCapOptions] = useState<string[]>([]);
  const [comuni, setComuni] = useState<ComuneOption[]>([]);
  const [loadingComuni, setLoadingComuni] = useState(false);

  useEffect(() => {
    setRegione("");
    setProvincia("");
    setComune("");
    setCap("");
    setCapOptions([]);
    setComuni([]);
  }, [resetKey]);

  const provinces = useMemo(
    () => (regione ? provincesForRegion(regione) : []),
    [regione],
  );

  useEffect(() => {
    if (!provincia) {
      setComuni([]);
      return;
    }

    const controller = new AbortController();
    setLoadingComuni(true);

    fetch(`/api/geo/comuni?sigla=${encodeURIComponent(provincia)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { comuni?: ComuneOption[] }) => {
        setComuni(data.comuni ?? []);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setComuni([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingComuni(false);
        }
      });

    return () => controller.abort();
  }, [provincia]);

  const comuneSuggestions = useMemo(() => {
    const query = comune.trim().toLowerCase();
    const filtered = query
      ? comuni.filter((item) => item.nome.toLowerCase().includes(query))
      : comuni;

    return filtered.slice(0, 40);
  }, [comuni, comune]);

  function applyComuneSelection(value: string) {
    setComune(value);
    const match = comuni.find(
      (item) => item.nome.toLowerCase() === value.trim().toLowerCase(),
    );

    if (match) {
      setCapOptions(match.cap);
      setCap(match.cap[0] ?? "");
      return;
    }

    setCapOptions([]);
    setCap("");
  }

  function handleRegionChange(value: string) {
    setRegione(value);
    setProvincia("");
    setComune("");
    setCap("");
    setCapOptions([]);
  }

  function handleProvinceChange(value: string) {
    setProvincia(value);
    setComune("");
    setCap("");
    setCapOptions([]);
  }

  return (
    <>
      <div className="input-row">
        <div className="input-group">
          <label htmlFor="regione">Regione (sede operativa)</label>
          <select
            id="regione"
            name="regione"
            value={regione}
            onChange={(event) => handleRegionChange(event.target.value)}
            required
          >
            <option value="">Seleziona regione</option>
            {ITALIAN_REGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="provincia">Provincia (sede operativa)</label>
          <select
            id="provincia"
            name="provincia"
            value={provincia}
            onChange={(event) => handleProvinceChange(event.target.value)}
            required
            disabled={!regione}
          >
            <option value="">
              {regione ? "Seleziona provincia" : "Seleziona prima la regione"}
            </option>
            {provinces.map((item) => (
              <option key={item.sigla} value={item.sigla}>
                {item.nome} ({item.sigla})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="comune">Comune (sede operativa)</label>
          <input
            id="comune"
            name="comune"
            list="comuni-list"
            value={comune}
            onChange={(event) => applyComuneSelection(event.target.value)}
            placeholder={
              loadingComuni
                ? "Caricamento comuni..."
                : provincia
                  ? "Cerca o seleziona comune"
                  : "Seleziona prima la provincia"
            }
            required
            disabled={!provincia || loadingComuni}
            autoComplete="address-level2"
          />
          <datalist id="comuni-list">
            {comuneSuggestions.map((item) => (
              <option key={item.nome} value={item.nome} />
            ))}
          </datalist>
        </div>

        <div className="input-group">
          <label htmlFor="cap">Cap (sede operativa)</label>
          {capOptions.length > 1 ? (
            <select
              id="cap"
              name="cap"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
              required
            >
              <option value="">Seleziona CAP</option>
              {capOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="cap"
              name="cap"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
              placeholder="20100"
              required
              readOnly={capOptions.length === 1}
              inputMode="numeric"
              autoComplete="postal-code"
            />
          )}
        </div>
      </div>
    </>
  );
}

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

  function applyComuneSelection(value: string) {
    setComune(value);

    if (!value) {
      setCapOptions([]);
      setCap("");
      return;
    }

    const match = comuni.find(
      (item) => item.nome.toLowerCase() === value.trim().toLowerCase(),
    );

    if (match) {
      const caps = match.cap.filter(Boolean);
      setCapOptions(caps);
      setCap(caps[0] ?? "");
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

  const capLocked = Boolean(comune) && capOptions.length === 1;
  const capNeedsChoice = capOptions.length > 1;

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
          <select
            id="comune"
            name="comune"
            value={comune}
            onChange={(event) => applyComuneSelection(event.target.value)}
            required
            disabled={!provincia || loadingComuni || comuni.length === 0}
          >
            <option value="">
              {loadingComuni
                ? "Caricamento comuni..."
                : provincia
                  ? "Seleziona comune"
                  : "Seleziona prima la provincia"}
            </option>
            {comuni.map((item) => (
              <option key={item.nome} value={item.nome}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="cap">Cap (sede operativa)</label>
          {capNeedsChoice ? (
            <select
              id="cap"
              name="cap"
              value={cap}
              onChange={(event) => setCap(event.target.value)}
              required
            >
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
              onChange={(event) => {
                if (!capLocked) setCap(event.target.value);
              }}
              placeholder={
                comune ? "Compilato automaticamente" : "Seleziona prima il comune"
              }
              required
              readOnly={capLocked || !comune}
              inputMode="numeric"
              autoComplete="postal-code"
              aria-describedby="cap-hint"
            />
          )}
          <p id="cap-hint" className="field-hint">
            {capNeedsChoice
              ? "Comune con più CAP: verifica o cambia se necessario."
              : capLocked
                ? "Compilato automaticamente dal comune selezionato."
                : "Si compila automaticamente dopo la selezione del comune."}
          </p>
        </div>
      </div>
    </>
  );
}

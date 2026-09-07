"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function safeAdminPath(value: string | null) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }
  return value;
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeAdminPath(searchParams.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Accesso non riuscito.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Errore di rete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="contact-form login-form" onSubmit={handleSubmit} autoComplete="off">
      <h1 style={{ marginBottom: "0.5rem" }}>Area Admin</h1>
      <p className="hero-subtitle" style={{ marginBottom: "1.5rem" }}>
        Accesso riservato agli operatori autorizzati. Le attività di accesso
        sono limitate e protette per motivi di sicurezza e privacy.
      </p>
      <div className="input-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Accesso..." : "Accedi"}
      </button>
      {error ? <p className="form-status error">{error}</p> : null}
    </form>
  );
}

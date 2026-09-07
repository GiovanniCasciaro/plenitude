import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="admin-shell">
      <Suspense fallback={<p className="form-status">Caricamento...</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}

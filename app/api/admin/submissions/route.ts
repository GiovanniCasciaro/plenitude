import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { listSubmissions } from "@/lib/store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const submissions = await listSubmissions();

  return NextResponse.json({
    submissions: submissions.map((submission) => ({
      id: submission.id,
      createdAt: submission.createdAt,
      email: submission.email,
      ragioneSociale: submission.ragioneSociale,
      partitaIva: submission.partitaIva,
      provincia: submission.provincia,
      comune: submission.comune,
      readAt: submission.readAt ?? null,
      deletedAt: submission.deletedAt ?? null,
    })),
  });
}

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getSubmission,
  markSubmissionRead,
  permanentlyDeleteSubmission,
  restoreSubmission,
  softDeleteSubmission,
} from "@/lib/store";

const ACTIONS = ["read", "trash", "restore", "purge"] as const;
type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && ACTIONS.includes(value as Action);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
  } | null;

  if (!isAction(body?.action)) {
    return NextResponse.json({ error: "Azione non valida." }, { status: 400 });
  }

  const existing = await getSubmission(id);
  if (!existing) {
    return NextResponse.json(
      { error: "Candidatura non trovata." },
      { status: 404 },
    );
  }

  try {
    switch (body.action) {
      case "read": {
        const submission = await markSubmissionRead(id);
        return NextResponse.json({ submission });
      }
      case "trash": {
        const submission = await softDeleteSubmission(id);
        return NextResponse.json({ submission });
      }
      case "restore": {
        const submission = await restoreSubmission(id);
        return NextResponse.json({ submission });
      }
      case "purge": {
        await permanentlyDeleteSubmission(id);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Azione non valida." }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin submission action error:", error);
    return NextResponse.json(
      { error: "Impossibile aggiornare la candidatura." },
      { status: 500 },
    );
  }
}

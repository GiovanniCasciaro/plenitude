import { NextResponse } from "next/server";
import { searchComuni } from "@/lib/comuni-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sigla = searchParams.get("sigla")?.trim().toUpperCase() ?? "";
  const query = searchParams.get("q") ?? "";

  if (!/^[A-Z]{2}$/.test(sigla)) {
    return NextResponse.json(
      { error: "Seleziona prima una provincia valida." },
      { status: 400 },
    );
  }

  const comuni = await searchComuni(sigla, query);
  return NextResponse.json({
    comuni: comuni.slice(0, 80),
  });
}

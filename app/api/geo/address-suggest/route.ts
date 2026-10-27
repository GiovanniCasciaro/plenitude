import { NextResponse } from "next/server";
import { searchItalianAddresses } from "@/lib/address-suggest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchItalianAddresses(query, { limit: 6 });
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { error: "Impossibile cercare indirizzi al momento." },
      { status: 502 },
    );
  }
}

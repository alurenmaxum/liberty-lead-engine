import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { computeFunnel } from "@/modules/analytics/funnel";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const from = new Date(searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString());
  const to = new Date(searchParams.get("to") ?? new Date().toISOString());

  const data = await computeFunnel(from, to);
  return NextResponse.json(data);
}

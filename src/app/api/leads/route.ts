import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllLeads } from "@/lib/pipeline";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leads = await getAllLeads();
  return NextResponse.json(leads);
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processIntake } from "@/lib/pipeline";

const schema = z.object({
  from: z.string().min(1),
  text: z.string().min(1),
  profileName: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body: unknown = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = await processIntake(parsed.data);
  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sequences = await db.nurtureSequence.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(sequences);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    name: string;
    trigger: string;
    steps: unknown[];
    active?: boolean;
  };
  const sequence = await db.nurtureSequence.create({
    data: {
      name: body.name,
      trigger: body.trigger,
      steps: body.steps as object[],
      active: body.active ?? true,
    },
  });
  return NextResponse.json(sequence, { status: 201 });
}

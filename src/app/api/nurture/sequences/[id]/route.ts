import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sequence = await db.nurtureSequence.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { lead: { select: { id: true, firstName: true, lastName: true, tier: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!sequence) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sequence);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const sequence = await db.nurtureSequence.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name as string }),
      ...(body.trigger !== undefined && { trigger: body.trigger as string }),
      ...(body.steps !== undefined && { steps: body.steps as object[] }),
      ...(body.active !== undefined && { active: body.active as boolean }),
    },
  });
  return NextResponse.json(sequence);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.nurtureSequence.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

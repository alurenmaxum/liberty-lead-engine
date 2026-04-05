import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pauseEnrollment, resumeEnrollment } from "@/modules/nurture/sequence-engine";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leadId = request.nextUrl.searchParams.get("leadId");

  const enrollments = await db.nurtureEnrollment.findMany({
    where: leadId ? { leadId } : undefined,
    include: {
      lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
      sequence: { select: { id: true, name: true, steps: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(enrollments);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { enrollmentId: string; action: "pause" | "resume" };

  if (body.action === "pause") {
    await pauseEnrollment(body.enrollmentId);
  } else if (body.action === "resume") {
    await resumeEnrollment(body.enrollmentId);
  }

  return NextResponse.json({ ok: true });
}

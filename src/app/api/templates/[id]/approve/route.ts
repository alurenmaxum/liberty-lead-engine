import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as { action: "approve" | "reject" };

  const template = await db.messageTemplate.update({
    where: { id },
    data: {
      approvalStatus: body.action === "approve" ? "APPROVED" : "REJECTED",
      approvedBy: session.user?.email ?? "unknown",
      approvedAt: new Date(),
    },
  });

  return NextResponse.json(template);
}

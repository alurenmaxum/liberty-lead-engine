import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: leadId } = await params;
  const { message } = (await req.json()) as { message?: string };

  if (!message?.trim()) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let conversation = await db.conversation.findFirst({
    where: { leadId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: { leadId, status: "ACTIVE" },
    });
  }

  const msg = await db.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUT",
      content: message.trim(),
      source: "HUMAN",
      sentAt: new Date(),
    },
  });

  return NextResponse.json(msg, { status: 201 });
}

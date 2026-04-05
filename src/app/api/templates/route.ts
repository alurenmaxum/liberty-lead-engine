import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await db.messageTemplate.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    name: string;
    category: string;
    content: string;
    variables?: Record<string, unknown>;
  };
  const template = await db.messageTemplate.create({
    data: {
      name: body.name,
      category: body.category,
      content: body.content,
      variables: (body.variables ?? {}) as object,
      approvalStatus: "DRAFT",
    },
  });
  return NextResponse.json(template, { status: 201 });
}

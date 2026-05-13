import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await req.json();
  if (!templateId || typeof templateId !== "number")
    return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });

  const user = await prisma.user.update({
    where: { username: session.user.username },
    data: { templateId },
  });

  return NextResponse.json({ ok: true, templateId: user.templateId });
}
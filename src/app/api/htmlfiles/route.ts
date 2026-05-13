import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.username === username;

  const files = await prisma.htmlFile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    files.map(f => ({
      ...f,
      htmlContent: f.isPrivate && !isOwner ? "" : f.htmlContent,
      password: "",
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, fileName, htmlContent, isPrivate, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const file = await prisma.htmlFile.create({
    data: { userId: user.id, title, fileName, htmlContent, isPrivate: !!isPrivate, password: isPrivate ? password : "" },
  });
  return NextResponse.json(file, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, fileName, htmlContent, isPrivate, password } = await req.json();
  const file = await prisma.htmlFile.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (file.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.htmlFile.update({
    where: { id },
    data: { title, fileName, htmlContent, isPrivate: !!isPrivate, password: isPrivate ? password : "" },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const file = await prisma.htmlFile.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (file.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.htmlFile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
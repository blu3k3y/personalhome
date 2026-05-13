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

  const gallery = await prisma.gallery.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    gallery.map(g => ({
      ...g,
      imageData: g.isPrivate && !isOwner ? null : g.imageData,
      password: "",
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, imageData, isPrivate, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const item = await prisma.gallery.create({
    data: { userId: user.id, title, imageData, isPrivate: !!isPrivate, password: isPrivate ? password : "" },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, imageData, isPrivate, password } = await req.json();
  const item = await prisma.gallery.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (item.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.gallery.update({
    where: { id },
    data: { title, imageData, isPrivate: !!isPrivate, password: isPrivate ? password : "" },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const item = await prisma.gallery.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { username: session.user.username } });
  if (item.userId !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.gallery.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}